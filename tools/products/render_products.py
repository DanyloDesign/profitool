"""
Profitool · packshot-рендеры товаров.

Восемь типов инструмента, каждый в цветах любого из брендов. Свет, ракурс и кадр
одинаковые на весь каталог: именно постоянство даёт витрине дорогой вид.
Фон прозрачный, снизу подложен мягкий контровой, чтобы силуэт читался на графите.

    blender -b -P tools/products/render_products.py -- --out public/products
    blender -b -P tools/products/render_products.py -- --out public/products \
        --tool rotary_hammer --brand makita --samples 64 --resolution 700
"""

import argparse
import math
import sys

import bpy
from mathutils import Vector

# Фирменные цвета корпусов. Значения линейные, поэтому темнее привычных hex.
BRANDS = {
    "makita": {"body": (0.00, 0.28, 0.30), "trim": (0.02, 0.02, 0.022)},
    "dewalt": {"body": (0.88, 0.48, 0.01), "trim": (0.02, 0.02, 0.022)},
    "bosch": {"body": (0.01, 0.12, 0.38), "trim": (0.02, 0.02, 0.022)},
    "metabo": {"body": (0.01, 0.30, 0.10), "trim": (0.02, 0.02, 0.022)},
    "milwaukee": {"body": (0.58, 0.01, 0.03), "trim": (0.02, 0.02, 0.022)},
    "ryobi": {"body": (0.28, 0.56, 0.06), "trim": (0.02, 0.02, 0.022)},
}


# ── сцена ────────────────────────────────────────────────────────────────────


def wipe():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def configure(resolution: int, samples: int):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 10

    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for device in prefs.devices:
            device.use = True
        scene.cycles.device = "GPU"
    except Exception as exc:  # noqa: BLE001
        print(f"[products] GPU недоступен, считаем на CPU: {exc}")
        scene.cycles.device = "CPU"

    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.compression = 40
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
    scene.view_settings.exposure = -0.1

    world = bpy.data.worlds.new("studio")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.035, 0.038, 0.042, 1.0)
    scene.world = world


def area_light(name, location, energy, size, color=(1, 1, 1), target=Vector((0, 0, 0))):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    obj.rotation_euler = (target - Vector(location)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(obj)
    return obj


def lights():
    # Ключевой сверху-слева-спереди: основной объём.
    area_light("key", (-4.6, -5.4, 5.0), 420, 11.0, (1.0, 0.98, 0.95))
    # Заполняющий справа, холоднее: пластик не уходит в грязь.
    area_light("fill", (5.2, -3.4, 1.6), 230, 6.0, (0.84, 0.90, 1.0))
    # Контровой сзади-сверху: белая кромка отделяет силуэт от тёмного фона.
    area_light("rim", (2.0, 5.6, 3.4), 340, 4.2, (0.92, 0.95, 1.0))
    # Сигнальный снизу-сзади: тёплая подсветка в духе «Цеха».
    area_light("signal", (-2.8, 3.4, -0.6), 120, 3.2, (1.0, 0.42, 0.16))


def camera():
    data = bpy.data.cameras.new("cam")
    data.lens = 120  # длинный фокус: packshot без перспективных искажений
    obj = bpy.data.objects.new("cam", data)
    bpy.context.collection.objects.link(obj)
    bpy.context.scene.camera = obj


def visible_meshes():
    return [o for o in bpy.context.scene.objects if o.type == "MESH" and not o.hide_render]


def frame(margin=1.04):
    points = []
    for obj in visible_meshes():
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))
    if not points:
        return
    center = sum(points, Vector()) / len(points)
    radius = max((p - center).length for p in points)

    cam = bpy.context.scene.camera
    direction = Vector((-0.62, -1.0, 0.40)).normalized()  # классические три четверти
    cam.location = center + direction * (radius * margin) / math.tan(cam.data.angle / 2)
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()


# ── материалы ────────────────────────────────────────────────────────────────


def _mat(name, base, roughness, metallic=0.0, clearcoat=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    inputs = bsdf.inputs
    if "Base Color" in inputs:
        inputs["Base Color"].default_value = (*base, 1.0)
    if "Roughness" in inputs:
        inputs["Roughness"].default_value = roughness
    if "Metallic" in inputs:
        inputs["Metallic"].default_value = metallic
    for key in ("Coat Weight", "Clearcoat"):
        if key in inputs:
            inputs[key].default_value = clearcoat
    return mat


def glass_palette(brand: str):
    """Литое стекло в цвете бренда: корпус прозрачный, начинка светится."""
    spec = BRANDS[brand]
    tint = tuple(min(1.0, c * 1.9 + 0.16) for c in spec["body"])
    body = _mat("glass_body", tint, 0.02)
    b = body.node_tree.nodes["Principled BSDF"].inputs
    for key, value in (("Transmission Weight", 1.0), ("Transmission", 1.0), ("IOR", 1.48),
                       ("Coat Weight", 0.6), ("Coat Roughness", 0.03)):
        if key in b:
            b[key].default_value = value

    clear = _mat("glass_clear", (0.72, 0.76, 0.80), 0.015)
    c = clear.node_tree.nodes["Principled BSDF"].inputs
    for key, value in (("Transmission Weight", 1.0), ("Transmission", 1.0), ("IOR", 1.52),
                       ("Coat Weight", 0.7)):
        if key in c:
            c[key].default_value = value

    glow = _mat("glow", (1.0, 0.22, 0.02), 0.4)
    g = glow.node_tree.nodes["Principled BSDF"].inputs
    if "Emission Color" in g:
        g["Emission Color"].default_value = (1.0, 0.22, 0.02, 1.0)
    if "Emission Strength" in g:
        g["Emission Strength"].default_value = 9.0

    frost = _mat("frost", spec["body"], 0.28)
    f = frost.node_tree.nodes["Principled BSDF"].inputs
    for key, value in (("Transmission Weight", 0.85), ("Transmission", 0.85), ("IOR", 1.45)):
        if key in f:
            f[key].default_value = value

    return {
        "body": body,
        "trim": clear,
        "rubber": frost,
        "steel": _mat("steel", (0.86, 0.88, 0.92), 0.08, metallic=1.0),
        "chrome": _mat("chrome", (0.92, 0.94, 0.97), 0.03, metallic=1.0),
        "dark": glow,
        "signal": glow,
        "glassish": clear,
    }


def glass_lights():
    """Цветные панели вокруг объекта: стекло живёт бликами, а не заливкой."""
    area_light("key", (-5.0, -4.6, 5.2), 900, 9.0, (1.0, 0.97, 0.92))
    area_light("cold", (-6.2, 1.4, 1.2), 700, 6.0, (0.30, 0.55, 1.0))
    area_light("warm", (6.0, 0.4, 0.8), 850, 6.0, (1.0, 0.36, 0.08))
    area_light("top", (0.4, 1.0, 7.0), 600, 7.0, (0.92, 0.95, 1.0))
    area_light("under", (0, -1.6, -4.2), 420, 7.0, (0.55, 0.70, 1.0))
    # Узкие полосы дают длинные блики на кромках — фирменный признак стекла.
    area_light("edge-l", (-4.4, -2.4, 1.6), 1400, 0.30)
    area_light("edge-r", (4.6, -1.8, 2.4), 1100, 0.24)


def palette(brand: str):
    spec = BRANDS[brand]
    return {
        "body": _mat("body", spec["body"], 0.42, clearcoat=0.0),
        "trim": _mat("trim", spec["trim"], 0.42),
        "rubber": _mat("rubber", (0.012, 0.013, 0.014), 0.72),
        "steel": _mat("steel", (0.55, 0.56, 0.58), 0.22, metallic=1.0),
        "chrome": _mat("chrome", (0.78, 0.79, 0.81), 0.08, metallic=1.0),
        "dark": _mat("dark", (0.028, 0.030, 0.033), 0.5),
        "signal": _mat("signal", (0.92, 0.12, 0.0), 0.35),
        "glassish": _mat("glassish", (0.06, 0.07, 0.08), 0.15, clearcoat=0.8),
    }


# ── примитивы ────────────────────────────────────────────────────────────────


def shade(obj, material, bevel=0.018, segments=3):
    obj.data.materials.append(material)
    if bevel:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(40)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if hasattr(bpy.ops.object, "shade_auto_smooth"):
        bpy.ops.object.shade_auto_smooth(angle=math.radians(38))
    obj.select_set(False)
    return obj


def box(scale, location=(0, 0, 0), rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.scale = scale
    return obj


def cyl(radius, depth, location=(0, 0, 0), rotation=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, location=location, rotation=rotation, vertices=verts
    )
    return bpy.context.active_object


def capsule(radius, length, location, axis, material, bevel=0.03):
    """Цилиндр с полусферами: корпус инструмента, а не труба."""
    rotation = {"X": (0, math.radians(90), 0), "Y": (math.radians(90), 0, 0), "Z": (0, 0, 0)}[axis]
    parts = [cyl(radius, length, location, rotation)]
    offset = Vector({"X": (length / 2, 0, 0), "Y": (0, length / 2, 0), "Z": (0, 0, length / 2)}[axis])
    for sign in (1, -1):
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=radius, location=Vector(location) + offset * sign, segments=40, ring_count=20
        )
        parts.append(bpy.context.active_object)
    for part in parts:
        shade(part, material, bevel=bevel)
    return parts


def sphere(radius, location=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=location, segments=44, ring_count=22)
    obj = bpy.context.active_object
    obj.scale = scale
    return obj


def cone(r1, r2, depth, location=(0, 0, 0), rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(
        radius1=r1, radius2=r2, depth=depth, location=location, rotation=rotation, vertices=44
    )
    return bpy.context.active_object


def vents(count, at, along, step, size, material, rotation=(0, 0, 0)):
    """Ряд вентиляционных щелей: мелочь, по которой глаз узнаёт инструмент."""
    made = []
    for i in range(count):
        offset = (i - (count - 1) / 2) * step
        location = Vector(at) + Vector(along) * offset
        made.append(shade(box(size, location, rotation), material, bevel=0.006))
    return made


# ── модели ───────────────────────────────────────────────────────────────────


def rotary_hammer(m):
    """Перфоратор SDS: корпус, пистолетная рукоятка, патрон, бур, боковая ручка."""
    capsule(0.44, 1.75, (0.05, 0, 1.15), "X", m["body"])
    shade(box((0.62, 0.70, 0.52), (-0.62, 0, 1.46)), m["body"], bevel=0.06)
    vents(7, (0.30, 0.41, 1.30), (1, 0, 0), 0.16, (0.05, 0.05, 0.30), m["dark"])
    vents(7, (0.30, -0.41, 1.30), (1, 0, 0), 0.16, (0.05, 0.05, 0.30), m["dark"])

    # рукоятка с курком
    shade(box((0.54, 0.50, 1.32), (-0.92, 0, 0.42), (0, math.radians(-9), 0)), m["body"], bevel=0.09)
    shade(box((0.14, 0.34, 0.60), (-0.74, 0, 0.66)), m["rubber"], bevel=0.03)
    shade(box((0.50, 0.44, 0.22), (-1.06, 0, -0.16)), m["trim"], bevel=0.05)

    # редуктор и патрон
    shade(cyl(0.40, 0.42, (1.02, 0, 1.15), (0, math.radians(90), 0)), m["trim"], bevel=0.03)
    shade(cyl(0.30, 0.62, (1.46, 0, 1.15), (0, math.radians(90), 0)), m["chrome"], bevel=0.02)
    shade(cyl(0.34, 0.16, (1.20, 0, 1.15), (0, math.radians(90), 0)), m["rubber"], bevel=0.02)

    # бур с двумя лопастями
    shade(cyl(0.105, 1.85, (2.62, 0, 1.15), (0, math.radians(90), 0)), m["steel"], bevel=0.01)
    for sign in (1, -1):
        shade(
            box((1.55, 0.05, 0.19), (2.55, 0, 1.15), (math.radians(28 * sign), 0, 0)),
            m["steel"],
            bevel=0.01,
        )
    shade(cone(0.17, 0.05, 0.26, (3.60, 0, 1.15), (0, math.radians(90), 0)), m["steel"], bevel=0.01)

    # боковая рукоятка охватом
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.46, minor_radius=0.075, location=(0.86, 0, 1.15),
        rotation=(0, math.radians(90), 0), major_segments=40, minor_segments=14,
    )
    shade(bpy.context.active_object, m["trim"], bevel=0)
    shade(box((0.16, 0.16, 0.86), (0.86, -0.34, 0.66), (math.radians(22), 0, 0)), m["rubber"], bevel=0.05)


def drill(m):
    """Аккумуляторный шурупокрут: корпус, патрон, кольцо момента, батарея."""
    capsule(0.38, 0.92, (0.08, 0, 1.62), "X", m["body"])
    shade(box((0.50, 0.60, 0.46), (-0.28, 0, 1.70)), m["body"], bevel=0.06)

    # патрон: кольцо момента, гильза, кулачки
    shade(cyl(0.34, 0.26, (0.70, 0, 1.62), (0, math.radians(90), 0)), m["trim"], bevel=0.02)
    for i in range(10):
        angle = (2 * math.pi * i) / 10
        shade(
            box((0.05, 0.05, 0.12), (0.70, 0.30 * math.cos(angle), 1.62 + 0.30 * math.sin(angle)),
                (angle, 0, 0)),
            m["dark"], bevel=0.005,
        )
    shade(cyl(0.29, 0.46, (1.06, 0, 1.62), (0, math.radians(90), 0)), m["chrome"], bevel=0.02)
    shade(cone(0.26, 0.17, 0.30, (1.40, 0, 1.62), (0, math.radians(-90), 0)), m["steel"], bevel=0.02)
    shade(cyl(0.055, 0.66, (1.72, 0, 1.62), (0, math.radians(90), 0)), m["steel"], bevel=0.008)

    # рукоятка, курок, батарея
    shade(box((0.44, 0.40, 1.08), (-0.14, 0, 0.92), (0, math.radians(-7), 0)), m["body"], bevel=0.07)
    shade(box((0.12, 0.30, 0.34), (0.12, 0, 1.24)), m["rubber"], bevel=0.03)
    shade(box((0.14, 0.34, 0.74), (-0.36, 0, 1.02)), m["rubber"], bevel=0.04)
    shade(box((0.74, 0.60, 0.40), (-0.22, 0, 0.30)), m["trim"], bevel=0.05)
    shade(box((0.52, 0.42, 0.10), (-0.22, 0, 0.09)), m["dark"], bevel=0.02)
    for i in range(4):
        shade(box((0.055, 0.055, 0.055), (-0.42 + i * 0.13, 0.31, 0.38)), m["signal"], bevel=0.008)


def grinder(m):
    """Кутова шліфмашина: корпус-труба, редуктор, кожух, диск."""
    capsule(0.34, 1.30, (-0.30, 0, 1.30), "X", m["body"])
    vents(7, (-0.35, 0.32, 1.30), (1, 0, 0), 0.14, (0.045, 0.05, 0.26), m["dark"])
    vents(7, (-0.35, -0.32, 1.30), (1, 0, 0), 0.14, (0.045, 0.05, 0.26), m["dark"])
    shade(box((0.30, 0.56, 0.44), (-1.10, 0, 1.30)), m["trim"], bevel=0.05)
    shade(box((0.44, 0.16, 0.20), (-0.70, -0.30, 1.06)), m["dark"], bevel=0.03)

    # голова редуктора
    shade(cyl(0.42, 0.52, (0.58, 0, 1.30), (0, math.radians(90), 0)), m["trim"], bevel=0.04)
    shade(cyl(0.40, 0.30, (0.74, 0, 1.06), (0, 0, 0)), m["trim"], bevel=0.03)

    # диск и гайка
    shade(cyl(0.98, 0.045, (0.74, 0, 0.44), (0, 0, 0), verts=80), m["steel"], bevel=0.008)
    shade(cyl(0.22, 0.14, (0.74, 0, 0.50)), m["chrome"], bevel=0.02)

    # защитный кожух: половина кольца над диском
    for i in range(22):
        angle = math.radians(-6 + i * 9)
        shade(
            box((0.30, 0.10, 0.34), (0.74 + 1.06 * math.cos(angle), 1.06 * math.sin(angle), 0.60),
                (0, 0, angle)),
            m["trim"], bevel=0.02,
        )
    shade(box((0.14, 0.14, 0.92), (0.74, 0.92, 1.12), (math.radians(-18), 0, 0)), m["rubber"], bevel=0.05)


def circular_saw(m):
    """Дискова пила: мотор, платформа, диск в кожухе, рукоятка."""
    capsule(0.42, 0.72, (-0.52, 0.10, 1.34), "Y", m["body"])
    shade(box((0.90, 0.56, 0.76), (0.06, 0.16, 1.34)), m["body"], bevel=0.08)
    shade(box((2.30, 1.24, 0.07), (0.30, 0.02, 0.36)), m["steel"], bevel=0.02)

    # диск и кожух
    shade(cyl(0.94, 0.05, (0.44, -0.40, 1.02), (math.radians(90), 0, 0), verts=80), m["chrome"], bevel=0.008)
    for i in range(26):
        angle = math.radians(i * 13.8)
        shade(
            box((0.13, 0.05, 0.13), (0.44 + 1.0 * math.cos(angle), -0.40, 1.02 + 1.0 * math.sin(angle)),
                (0, angle, 0)),
            m["steel"], bevel=0.008,
        )
    for i in range(18):
        angle = math.radians(6 + i * 10)
        shade(
            box((0.26, 0.20, 0.10), (0.44 + 1.06 * math.cos(angle), -0.40, 1.02 + 1.06 * math.sin(angle)),
                (0, -angle, 0)),
            m["trim"], bevel=0.02,
        )

    # рукоятки
    shade(box((0.94, 0.30, 0.26), (-0.36, 0.16, 2.06), (0, math.radians(-8), 0)), m["body"], bevel=0.07)
    shade(box((0.30, 0.34, 0.60), (-0.82, 0.16, 1.76)), m["body"], bevel=0.07)
    shade(box((0.52, 0.26, 0.24), (0.66, 0.16, 1.96)), m["rubber"], bevel=0.05)


def sander(m):
    """Ексцентрикова шліфмашина: корпус-гриб, подошва, пилозбірник."""
    shade(sphere(0.62, (0, 0, 1.28), (1.0, 1.0, 0.72)), m["body"], bevel=0)
    shade(cyl(0.60, 0.46, (0, 0, 0.92)), m["body"], bevel=0.06)
    shade(cyl(0.72, 0.20, (0, 0, 0.60)), m["trim"], bevel=0.04)
    shade(cyl(0.74, 0.14, (0, 0, 0.44), verts=72), m["dark"], bevel=0.02)

    # отверстия пылеотвода в подошве
    for i in range(6):
        angle = (2 * math.pi * i) / 6
        shade(cyl(0.09, 0.18, (0.44 * math.cos(angle), 0.44 * math.sin(angle), 0.40)), m["trim"], bevel=0.01)

    shade(box((0.44, 0.34, 0.30), (0, 0.72, 1.06), (math.radians(16), 0, 0)), m["trim"], bevel=0.05)
    shade(box((0.62, 0.52, 0.44), (0, 1.08, 1.12), (math.radians(16), 0, 0)), m["glassish"], bevel=0.06)
    shade(cyl(0.16, 0.12, (0.34, -0.40, 1.52)), m["signal"], bevel=0.02)
    vents(5, (0, -0.58, 1.34), (1, 0, 0), 0.13, (0.05, 0.05, 0.16), m["dark"])


def laser_level(m):
    """Лазерний нівелір: корпус з гумовими вставками, вікна випромінювачів."""
    shade(box((1.10, 0.86, 1.02), (0, 0, 1.00)), m["body"], bevel=0.10, segments=5)
    shade(box((1.16, 0.20, 1.06), (0, 0.36, 1.00)), m["rubber"], bevel=0.08)
    shade(box((1.16, 0.20, 1.06), (0, -0.36, 1.00)), m["rubber"], bevel=0.08)
    shade(cyl(0.30, 0.16, (0, -0.46, 1.22), (math.radians(90), 0, 0)), m["dark"], bevel=0.02)
    shade(cyl(0.20, 0.10, (0, -0.52, 1.22), (math.radians(90), 0, 0)), m["signal"], bevel=0.01)
    shade(box((0.10, 0.10, 0.34), (0, -0.50, 0.62)), m["signal"], bevel=0.01)
    shade(box((0.62, 0.34, 0.20), (0, 0.20, 1.60)), m["trim"], bevel=0.04)
    shade(box((0.42, 0.24, 0.10), (0, -0.30, 1.56)), m["glassish"], bevel=0.02)
    shade(cyl(0.52, 0.14, (0, 0, 0.42), verts=56), m["trim"], bevel=0.03)
    for i in range(3):
        shade(box((0.14, 0.10, 0.06), (-0.22 + i * 0.22, -0.48, 0.86)), m["dark"], bevel=0.01)


def bit_set(m):
    """Набір біт у кейсі: відкрита коробка з рядами оснастки."""
    shade(box((2.30, 1.40, 0.24), (0, 0, 0.32)), m["trim"], bevel=0.06)
    shade(box((2.18, 1.28, 0.10), (0, 0, 0.44)), m["dark"], bevel=0.03)
    shade(box((2.30, 0.22, 1.10), (0, 0.80, 0.80), (math.radians(-24), 0, 0)), m["body"], bevel=0.06)

    for row, z_off in enumerate((0.0, 0.42)):
        for i in range(9):
            x = -0.92 + i * 0.23
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.072, depth=0.58, location=(x, -0.28 + z_off, 0.70), vertices=6
            )
            shade(bpy.context.active_object, m["steel"] if row else m["chrome"], bevel=0.008)
            shade(box((0.10, 0.045, 0.10), (x, -0.28 + z_off, 1.02)), m["signal"], bevel=0.006)

    shade(cyl(0.30, 0.30, (1.42, 0.10, 0.62)), m["chrome"], bevel=0.03)
    shade(cyl(0.16, 0.44, (1.42, 0.10, 0.92)), m["steel"], bevel=0.02)


def helmet(m):
    """Каска з козирком і ременем: спецодяг і захист."""
    dome = sphere(1.02, (0, 0, 1.06), (1.0, 1.12, 0.86))
    cutter = box((5, 5, 2), (0, 0, -0.28))
    mod = dome.modifiers.new("cut", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    mod.solver = "FLOAT"
    cutter.hide_render = True
    cutter.hide_viewport = True
    shade(dome, m["body"], bevel=0)

    shade(box((0.20, 2.10, 0.12), (0, 0, 1.78)), m["body"], bevel=0.05)
    for sign in (1, -1):
        shade(box((0.14, 1.60, 0.10), (0.44 * sign, 0, 1.66)), m["body"], bevel=0.04)

    brim = cyl(1.18, 0.10, (0, -0.52, 0.84), verts=72)
    brim.scale = (1.0, 0.68, 1.0)
    shade(brim, m["body"], bevel=0.04)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.96, minor_radius=0.055, location=(0, 0, 0.78),
        major_segments=56, minor_segments=14,
    )
    shade(bpy.context.active_object, m["trim"], bevel=0)
    shade(box((0.44, 0.10, 0.22), (0, -0.84, 0.94)), m["signal"], bevel=0.02)


TOOLS = {
    "rotary_hammer": rotary_hammer,
    "drill": drill,
    "grinder": grinder,
    "circular_saw": circular_saw,
    "sander": sander,
    "laser_level": laser_level,
    "bit_set": bit_set,
    "helmet": helmet,
}


# ── прогон ───────────────────────────────────────────────────────────────────


def render_one(tool: str, brand: str, out_dir: str, resolution: int, samples: int, style: str = "solid"):
    wipe()
    configure(resolution, samples)
    camera()
    if style == "glass":
        glass_lights()
        scene = bpy.context.scene
        scene.cycles.transmission_bounces = 24
        scene.cycles.max_bounces = 24
        scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.06, 0.07, 0.09, 1.0)
        TOOLS[tool](glass_palette(brand))
    else:
        lights()
        TOOLS[tool](palette(brand))
    bpy.context.view_layer.update()
    frame()

    scene = bpy.context.scene
    suffix = "-glass" if style == "glass" else ""
    scene.render.filepath = f"{out_dir.rstrip('/')}/{tool}-{brand}{suffix}"
    bpy.ops.render.render(write_still=True)
    print(f"[products] готово: {scene.render.filepath}.png")


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="public/products")
    parser.add_argument("--tool", default=None)
    parser.add_argument("--brand", default=None)
    parser.add_argument("--resolution", type=int, default=900)
    parser.add_argument("--samples", type=int, default=110)
    parser.add_argument("--style", default="solid", choices=["solid", "glass"])
    args = parser.parse_args(argv)

    tools = [args.tool] if args.tool else list(TOOLS)
    brands = [args.brand] if args.brand else list(BRANDS)
    for tool in tools:
        for brand in brands:
            render_one(tool, brand, args.out, args.resolution, args.samples, args.style)


if __name__ == "__main__":
    main()
