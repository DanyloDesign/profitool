"""
Profitool · иконки категорий для витрины.

Промышленное литое стекло с оранжевым ядром внутри и металлической деталью.
Объекты узнаваемые: патрон SDS, кулачковый патрон, отрезной диск, пильный диск,
шлифовальная подошва, лазерный крест, набор бит, каска.

    blender -b -P tools/icons/render_icons.py -- --out public/icons
    blender -b -P tools/icons/render_icons.py -- --out public/icons --only sds --samples 64
"""

import argparse
import math
import sys

import bpy
from mathutils import Vector

SIGNAL = (1.0, 0.18, 0.0, 1.0)  # #FF4A00 в линейном приближении
GLASS_TINT = (0.62, 0.66, 0.70, 1.0)
STEEL = (0.52, 0.54, 0.56, 1.0)


# ── сцена ────────────────────────────────────────────────────────────────────


def wipe():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def configure(resolution: int, samples: int):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 16
    scene.cycles.transmission_bounces = 12
    scene.cycles.transparent_max_bounces = 16

    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for device in prefs.devices:
            device.use = True
        scene.cycles.device = "GPU"
    except Exception as exc:  # noqa: BLE001 — на чужой машине просто считаем на CPU
        print(f"[icons] GPU недоступен, считаем на CPU: {exc}")
        scene.cycles.device = "CPU"

    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy"

    # Мир тёмный: он не попадёт в альфу, но стекло его преломляет и получает объём.
    world = bpy.data.worlds.new("shop")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.021, 0.023, 0.025, 1.0)
    bg.inputs[1].default_value = 1.0
    scene.world = world


def camera():
    data = bpy.data.cameras.new("cam")
    data.lens = 105  # длинный фокус: форма не разъезжается к краям кадра
    obj = bpy.data.objects.new("cam", data)
    bpy.context.collection.objects.link(obj)
    bpy.context.scene.camera = obj


def visible_meshes():
    return [o for o in bpy.context.scene.objects if o.type == "MESH" and not o.hide_render]


def frame_objects(margin=1.34):
    """Ставит камеру так, чтобы объект целиком влез в кадр с полями."""
    points = []
    for obj in visible_meshes():
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))
    if not points:
        return
    center = sum(points, Vector()) / len(points)
    radius = max((p - center).length for p in points)

    cam = bpy.context.scene.camera
    direction = Vector((-0.16, -1.0, 0.44)).normalized()
    distance = (radius * margin) / math.tan(cam.data.angle / 2)
    cam.location = center + direction * distance
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()


def area_light(name, location, rotation, energy, size, color=(1, 1, 1)):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    obj.rotation_euler = rotation
    bpy.context.collection.objects.link(obj)
    return obj


def lights():
    # Ключевой сверху-слева, холодный: даёт металлу характер.
    area_light("key", (-3.6, -3.2, 5.2), (math.radians(38), 0, math.radians(-36)), 900, 5.0, (0.86, 0.92, 1.0))
    # Заполняющий справа, нейтральный.
    area_light("fill", (4.3, -1.6, 1.9), (math.radians(78), 0, math.radians(62)), 320, 4.0)
    # Контровой сигнальным: обводит силуэт оранжевым.
    area_light("rim", (1.4, 4.6, 2.4), (math.radians(108), 0, math.radians(196)), 620, 3.2, (1.0, 0.42, 0.16))
    # Нижний слабый, чтобы стекло не проваливалось в чёрное.
    area_light("bounce", (0, -2.2, -3.4), (math.radians(-64), 0, 0), 160, 5.0, (0.7, 0.78, 0.9))
    # Узкие полосы света: стекло ловит их как блики на кромках.
    area_light("strip-l", (-5.0, -1.0, 0.6), (math.radians(90), 0, math.radians(-90)), 700, 0.35)
    area_light("strip-r", (5.0, -0.6, 1.2), (math.radians(90), 0, math.radians(90)), 520, 0.28)


# ── материалы ────────────────────────────────────────────────────────────────


def _principled(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    return mat, mat.node_tree.nodes["Principled BSDF"]


def _set(node, key, value):
    """Имена сокетов в Principled кочуют между версиями, поэтому мягко."""
    if key in node.inputs:
        node.inputs[key].default_value = value


def glass_material():
    mat, bsdf = _principled("glass_industrial")
    _set(bsdf, "Base Color", GLASS_TINT)
    _set(bsdf, "Metallic", 0.0)
    _set(bsdf, "Roughness", 0.025)
    _set(bsdf, "IOR", 1.46)
    _set(bsdf, "Transmission Weight", 1.0)
    _set(bsdf, "Transmission", 1.0)
    _set(bsdf, "Coat Weight", 0.35)
    _set(bsdf, "Coat Roughness", 0.04)
    mat.use_screen_refraction = True
    return mat


def core_material():
    mat, bsdf = _principled("core_signal")
    _set(bsdf, "Base Color", SIGNAL)
    _set(bsdf, "Emission Color", SIGNAL)
    _set(bsdf, "Emission Strength", 7.5)
    _set(bsdf, "Roughness", 0.4)
    return mat


def steel_material():
    mat, bsdf = _principled("steel")
    _set(bsdf, "Base Color", STEEL)
    _set(bsdf, "Metallic", 1.0)
    _set(bsdf, "Roughness", 0.27)
    return mat


def rubber_material():
    mat, bsdf = _principled("rubber")
    _set(bsdf, "Base Color", (0.035, 0.037, 0.04, 1.0))
    _set(bsdf, "Roughness", 0.62)
    return mat


# ── помощники геометрии ──────────────────────────────────────────────────────


def shade(obj, material, bevel=0.012, segments=3, smooth=True):
    obj.data.materials.append(material)
    if bevel:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(38)
    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True
        # В 4.1+ auto_smooth заменили оператором; на старых сборках его просто нет.
        if hasattr(bpy.ops.object, "shade_auto_smooth"):
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.shade_auto_smooth(angle=math.radians(38))
            obj.select_set(False)
    return obj


def cylinder(radius, depth, location=(0, 0, 0), rotation=(0, 0, 0), verts=64):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, location=location, rotation=rotation, vertices=verts
    )
    return bpy.context.active_object


def cube(size, location=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cube_add(size=size, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.scale = scale
    return obj


def torus(major, minor, location=(0, 0, 0), rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major,
        minor_radius=minor,
        location=location,
        rotation=rotation,
        major_segments=64,
        minor_segments=20,
    )
    return bpy.context.active_object


def ring_of(count, radius, builder, z=0.0, phase=0.0):
    made = []
    for i in range(count):
        angle = phase + (2 * math.pi * i) / count
        made.append(builder(angle, Vector((radius * math.cos(angle), radius * math.sin(angle), z))))
    return made


def boolean_cut(target, cutter):
    mod = target.modifiers.new("cut", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    mod.solver = "FLOAT"
    cutter.hide_render = True
    cutter.hide_viewport = True
    return target


# ── иконки ───────────────────────────────────────────────────────────────────
# Каждая строит объект вокруг начала координат в габарите примерно 2.6 единицы.


def icon_sds(glass, core, steel, rubber):
    """Патрон SDS-Max с буром: перфораторы."""
    body = shade(cylinder(1.02, 1.5, (0, 0, -0.18)), glass, bevel=0.05)
    collar = shade(cylinder(1.12, 0.22, (0, 0, 0.44)), steel, bevel=0.03)
    heart = shade(cylinder(0.56, 1.34, (0, 0, -0.18)), core, bevel=0.03)

    shank = shade(cylinder(0.24, 1.9, (0, 0, 1.4)), steel, bevel=0.02)
    # Две встречные лопасти вместо честной спирали: в силуэте читается так же.
    for sign in (1, -1):
        blade = cube(
            1.0,
            location=(0, 0, 1.45),
            rotation=(0, 0, math.radians(38 * sign)),
            scale=(0.44, 0.07, 0.9),
        )
        shade(blade, steel, bevel=0.02)
    shade(cylinder(0.3, 0.16, (0, 0, 2.42)), core, bevel=0.02)
    return [body, collar, heart, shank]


def icon_chuck(glass, core, steel, rubber):
    """Кулачковый патрон с шестигранной битой: шуруповёрты."""
    body = shade(cylinder(0.95, 1.25, (0, 0, -0.35)), glass, bevel=0.05)
    shade(cylinder(0.52, 1.1, (0, 0, -0.35)), core, bevel=0.03)

    def jaw(angle, position):
        j = cube(
            1.0,
            location=(position.x * 0.62, position.y * 0.62, 0.42),
            rotation=(math.radians(13), 0, angle),
            scale=(0.2, 0.3, 0.52),
        )
        return shade(j, steel, bevel=0.02)

    jaws = ring_of(3, 1.0, jaw, phase=math.radians(90))

    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.5, location=(0, 0, 1.4), vertices=6)
    bit = shade(bpy.context.active_object, steel, bevel=0.02)
    shade(cylinder(0.12, 0.42, (0, 0, 2.2)), core, bevel=0.01)
    return [body, bit, *jaws]


def icon_cutdisc(glass, core, steel, rubber):
    """Отрезной круг с вентиляционными прорезями: УШМ."""
    disc = shade(cylinder(1.5, 0.12, (0, 0, 0), rotation=(math.radians(78), 0, 0), verts=96), glass, bevel=0.02)

    def slot(angle, position):
        s = cube(
            1.0,
            location=(position.x, 0.0, position.z + position.y),
            rotation=(math.radians(78), 0, 0),
            scale=(0.055, 0.5, 0.42),
        )
        s.rotation_euler.rotate_axis("Y", angle)
        return shade(s, core, bevel=0.01)

    slots = ring_of(8, 0.0, slot)
    for i, s in enumerate(slots):
        angle = (2 * math.pi * i) / 8
        s.location = (0.98 * math.cos(angle), 0.21 * math.sin(angle), 0.98 * math.sin(angle) * 0.97)
        s.rotation_euler = (math.radians(78), 0, 0)
        s.rotation_euler.rotate_axis("Y", angle)

    hub = shade(cylinder(0.42, 0.2, (0, 0, 0), rotation=(math.radians(78), 0, 0)), steel, bevel=0.02)
    bore = shade(cylinder(0.17, 0.32, (0, 0, 0), rotation=(math.radians(78), 0, 0)), core, bevel=0.01)
    return [disc, hub, bore, *slots]


def icon_sawblade(glass, core, steel, rubber):
    """Пильный диск с зубьями: пилы."""
    plate = shade(cylinder(1.32, 0.1, (0, 0, 0), rotation=(math.radians(78), 0, 0), verts=96), glass, bevel=0.02)

    teeth = []
    for i in range(16):
        angle = (2 * math.pi * i) / 16
        t = cube(
            1.0,
            location=(1.4 * math.cos(angle), 0.0, 1.4 * math.sin(angle) * 0.97),
            rotation=(math.radians(78), 0, 0),
            scale=(0.16, 0.06, 0.16),
        )
        t.rotation_euler.rotate_axis("Y", angle + math.radians(22))
        teeth.append(shade(t, steel, bevel=0.012))

    hub = shade(cylinder(0.46, 0.18, (0, 0, 0), rotation=(math.radians(78), 0, 0)), steel, bevel=0.02)
    bore = shade(cylinder(0.19, 0.3, (0, 0, 0), rotation=(math.radians(78), 0, 0)), core, bevel=0.01)
    return [plate, hub, bore, *teeth]


def icon_sanding(glass, core, steel, rubber):
    """Шлифовальная подошва с отверстиями пылеотвода: шлифмашины."""
    pad = shade(cylinder(1.42, 0.46, (0, 0, -0.1), verts=96), glass, bevel=0.07, segments=5)
    shade(cylinder(1.18, 0.16, (0, 0, 0.2), verts=96), core, bevel=0.03)

    holes = []
    for i in range(6):
        angle = (2 * math.pi * i) / 6
        holes.append(
            shade(
                cylinder(0.17, 0.62, (0.84 * math.cos(angle), 0.84 * math.sin(angle), 0.12)),
                steel,
                bevel=0.01,
            )
        )
    stem = shade(cylinder(0.3, 0.9, (0, 0, 0.7)), steel, bevel=0.02)
    return [pad, stem, *holes]


def icon_laser(glass, core, steel, rubber):
    """Лазерный крест над корпусом: измерительный инструмент."""
    body = shade(cube(1.0, location=(0, 0, -0.62), scale=(1.08, 0.72, 0.5)), glass, bevel=0.07, segments=5)
    shade(cube(1.0, location=(0, -0.42, -0.62), scale=(0.62, 0.05, 0.22)), core, bevel=0.02)

    beam_h = shade(cube(1.0, location=(0, 0, 0.55), scale=(1.5, 0.045, 0.045)), core, bevel=0.01)
    beam_v = shade(cube(1.0, location=(0, 0, 0.55), scale=(0.045, 0.045, 1.05)), core, bevel=0.01)
    head = shade(cylinder(0.34, 0.34, (0, 0, -0.05)), steel, bevel=0.03)
    return [body, beam_h, beam_v, head]


def icon_bits(glass, core, steel, rubber):
    """Три биты в держателе: оснастка."""
    rail = shade(cube(1.0, location=(0, 0, -0.95), scale=(1.45, 0.42, 0.2)), glass, bevel=0.05, segments=4)
    made = [rail]
    for i, offset in enumerate((-0.86, 0.0, 0.86)):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.235, depth=1.45, location=(offset, 0, -0.1), vertices=6)
        made.append(shade(bpy.context.active_object, steel, bevel=0.02))
        tip = cube(1.0, location=(offset, 0, 0.78), scale=(0.2, 0.06, 0.2))
        made.append(shade(tip, core, bevel=0.015))
        if i == 1:
            made.append(shade(cylinder(0.3, 0.16, (offset, 0, -0.86)), core, bevel=0.02))
    return made


def icon_helmet(glass, core, steel, rubber):
    """Каска с козырьком: спецодежда и защита."""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.18, location=(0, 0, -0.1), segments=64, ring_count=32)
    dome = bpy.context.active_object
    dome.scale = (1.0, 1.0, 0.82)
    cutter = cube(6.0, location=(0, 0, -3.1))
    boolean_cut(dome, cutter)
    shade(dome, glass, bevel=0.0)

    crest = shade(cube(1.0, location=(0, 0, 0.72), scale=(0.11, 0.98, 0.16)), core, bevel=0.02)
    brim = shade(
        cylinder(1.36, 0.14, (0, 0.12, -0.16), verts=96),
        glass,
        bevel=0.04,
    )
    brim.scale = (1.0, 0.72, 1.0)
    band = shade(torus(1.2, 0.07, (0, 0, -0.06)), core)
    return [dome, crest, brim, band]


ICONS = {
    "sds": icon_sds,
    "chuck": icon_chuck,
    "cutdisc": icon_cutdisc,
    "sawblade": icon_sawblade,
    "sanding": icon_sanding,
    "laser": icon_laser,
    "bits": icon_bits,
    "helmet": icon_helmet,
}


# ── прогон ───────────────────────────────────────────────────────────────────


def render_icon(name, out_dir, resolution, samples):
    wipe()
    configure(resolution, samples)
    camera()
    lights()

    glass, core, steel, rubber = (
        glass_material(),
        core_material(),
        steel_material(),
        rubber_material(),
    )
    ICONS[name](glass, core, steel, rubber)
    bpy.context.view_layer.update()
    frame_objects()

    scene = bpy.context.scene
    scene.render.filepath = f"{out_dir.rstrip('/')}/{name}"
    bpy.ops.render.render(write_still=True)
    print(f"[icons] готово: {scene.render.filepath}.png")


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="public/icons")
    parser.add_argument("--only", default=None)
    parser.add_argument("--resolution", type=int, default=1024)
    parser.add_argument("--samples", type=int, default=220)
    args = parser.parse_args(argv)

    names = [args.only] if args.only else list(ICONS)
    for name in names:
        if name not in ICONS:
            raise SystemExit(f"[icons] нет такой иконки: {name}. Есть: {', '.join(ICONS)}")
        render_icon(name, args.out, args.resolution, args.samples)


if __name__ == "__main__":
    main()
