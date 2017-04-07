///<reference path="../typings/index.d.ts"/>
import Stats  = require('stats.js');
import config from './config';
import * as THREE from 'three';

export default class Game {

    renderer    :   THREE.WebGLRenderer;
    camera      :   THREE.PerspectiveCamera;
    scene       :   THREE.Scene;

    stats       :   Stats;

    geometry    :   THREE.Geometry;
    surfacemesh :   THREE.Mesh;
    wiremesh    :   THREE.Mesh;

    clearColor  :   THREE.Color

    //cameraControls:THREE.Track TODO rewrite trackball control

    constructor() {
        console.log('START');
        this.clearColor = new THREE.Color(0xBBBBBB);

        let container = document.querySelector(config.domSelector);
        this.renderer = new THREE.WebGLRenderer({
            antialias               :   true,
            preserveDrawingBuffer   :   true
        });
        this.renderer.setSize(config.rendererW, config.rendererH);
        this.renderer.setClearColor( this.clearColor, 1 );
        container.appendChild(this.renderer.domElement);
        console.log('renderer added');

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        document.appendChild(this.stats.domElement);

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
