import * as THREE from 'three';

import init from './init';
import { DragControls } from 'three/addons/controls/DragControls.js';


import './style.css';


const { sizes, camera, scene, canvas, controls, renderer } = init();

let figures=[]
let dControls;

camera.position.set(0, 2, 5);

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
		color: '#444444',
		metalness: 0,
		roughness: 0.5,
	})
);

floor.receiveShadow = true;

floor.rotation.x = -Math.PI * 0.5;

scene.add(floor)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);


const dirLight = new THREE.DirectionalLight( 0xffffff, 0.61);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow =true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);

};
tick();

window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});


const cube_button = document.getElementById("cube")
const sphere_button = document.getElementById("sphere")
const prisma_button = document.getElementById("prisma")
const drag_drop_button = document.getElementById("dragdrop")

cube_button.addEventListener('click', add_cube)
sphere_button.addEventListener('click', add_sphere)
prisma_button.addEventListener('click', add_prisma)
drag_drop_button.addEventListener('click', drag_drop)


function add_cube() {
	turnOnControls()
	const geometry_cube = new THREE.BoxGeometry(1, 1, 1);
	const material_cube = new THREE.MeshBasicMaterial({
		color: 'gray',
		wireframe: true,
	});
	const mesh_cube = new THREE.Mesh(geometry_cube, material_cube);
	mesh_cube.position.y = 0.51
	mesh_cube.isDraggable= true;
	scene.add(mesh_cube);
	figures.push(mesh_cube);
}

function add_sphere(){
	turnOnControls()
	const geometry_sphere = new THREE.SphereGeometry(0.5, 16, 16);
	const material_sphere = new THREE.MeshBasicMaterial({
		color: 'gray',
		wireframe: true,
	});
	const mesh_sphere = new THREE.Mesh(geometry_sphere, material_sphere);
	mesh_sphere.position.y = 0.51
	mesh_sphere.isDraggable= true;
	scene.add(mesh_sphere);
	figures.push(mesh_sphere);
}

function add_prisma(){
	turnOnControls()
	const geometry_prisma = new THREE.BoxGeometry(1, 1, 2);
	const material_prisma = new THREE.MeshBasicMaterial({
		color: 'gray',
		wireframe: true,
	});
	const mesh_prisma = new THREE.Mesh(geometry_prisma, material_prisma);
	mesh_prisma.position.y = 0.51
	mesh_prisma.isDraggable= true;
	scene.add(mesh_prisma);
	figures.push(mesh_prisma);
}

function turnOnControls(){
	if (typeof dControls!=='undefined'){
		dControls.deactivate();
		dControls.enabled = false;
	}
	console.log(dControls)
	controls.enabled = true;
}

function turnOffControls() {
	controls.enabled = false;
	if (typeof dControls!=='undefined'){
		dControls.activate();
	}
}

let flag = true;

function drag_drop() {
	if (flag) {
		turnOffControls();
		dControls = new DragControls(figures, camera, renderer.domElement);
	}
	else {
		turnOnControls();
	}
	flag=!flag;
}



