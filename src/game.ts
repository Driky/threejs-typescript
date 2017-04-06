///<reference path="../typings/index.d.ts"/>
import config from './config';
import * as THREE from 'three'; 

export default class Game {

    renderer: THREE.Renderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;

    constructor() {
        console.log('START');

        let container = document.querySelector(config.domSelector);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(config.rendererW, config.rendererH);
        container.appendChild(this.renderer.domElement);
        console.log('renderer added');

        this.camera = new THREE.PerspectiveCamera(config.cameraViewAngle, (config.rendererW/config.rendererH), config.cameraNear, config.cameraFar);
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        console.log('scene initialized');

        //mesh
        let sphereMaterial:THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000})
        let sphere:THREE.Mesh = new THREE.Mesh(
            new THREE.SphereGeometry( 50, 16, 16), sphereMaterial
        );
        sphere.position.z = -300;
        this.scene.add(sphere);

        //light
        let pointLight:THREE.PointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 130;
        this.scene.add(pointLight);

        window.addEventListener( 'resize', this.onWindowResize, false );

        // Schedule the first frame.
        requestAnimationFrame(this.render);
        
    }

    private render = ():void => {
        console.log("Render function start")

        this.update();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }

    private update(){

    }

    private onWindowResize = ():void => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
}
