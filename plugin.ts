import { StoredCamera } from "./camera";
import i18n from "./i18n";

const storageKey = 'cameras';
let cameras: StoredCamera[] = [];

const section = ui.createProjectPanelSection();
section.add(new ui.Paragraph(i18n.Save_Camera_Instruction()));

section.add(new ui.Button(ui.icons.plus, i18n.Save_Camera(), async () => {
    const name = new Date().toLocaleString();

    const camera = map.camera.getCurrentCamera();
    const stored = {
        name,
        date: new Date().toISOString(),
        x: camera.x, y: camera.y, z: camera.z, 
        heading: camera.heading, pitch: camera.pitch, roll: camera.roll 
    };

    cameras.push(stored);
    save();

    addCamera(stored);
}));

const cameraContainer = new ui.Container();
section.add(cameraContainer);

const addCamera = (camera: StoredCamera) => {
    const section = new ui.Section(new Date(camera.date).toLocaleString());

    section.createAction(ui.icons.close, i18n.Remove_Camera(), async () => {
        cameras.splice(cameras.indexOf(camera), 1);
        save();
        
        cameraContainer.remove(section);
    });

    if (cameraContainer.children[0]) {
        cameraContainer.insertBefore(section, cameraContainer.children[0]);
    } else {
        cameraContainer.add(section);
    }

    const name = new ui.TextField(null, camera.name, i18n.Name());
    section.add(name);

    name.onValueChange.subscribe(() => {
        camera.name = name.value;
        save();
    });

    section.add(new ui.Button(i18n.Fly_To_Camera(), () => {
        map.camera.focus(new map.camera.Camera(
            camera.x, camera.y, camera.z, 
            camera.heading, camera.pitch, camera.roll
        ));
    }));
};

const save = () => {
    Storage.user.write(storageKey, cameras);
};

Storage.user.read<StoredCamera[]>(storageKey).then(data => {
    cameras = data || [];

    for (let camera of cameras) {
        addCamera(camera);
    }
});
