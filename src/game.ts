///<reference path="../typings/index.d.ts"/>
import Stats  = require('stats.js');
import config from './config';
import * as THREE from 'three';
console.log("Stats = ",Stats);
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

        //this.stats = new Stats();
        /*this.stats.showPanel( 1 );
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        document.appendChild(this.stats.domElement);*/

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(config.cameraViewAngle, (config.rendererW/config.rendererH), config.cameraNear, config.cameraFar);
        this.camera.position.set(0, 0, 40);
        this.scene.add(this.camera);
        console.log('scene initialized');

        //TODO add camera control here

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
        requestAnimationFrame(this.animate);
        
    }

    private animate = ():void => {
        // this.stats.begin();
        console.log("Render function start")        
        requestAnimationFrame(this.animate);

        this.update();

        this.render();
        
        // this.stats.end();
    }

    private update(){

    }

    //we can check for dom change here for example
    private render(){
        let PIseconds	= Date.now() * Math.PI;

        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize = ():void => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
}
