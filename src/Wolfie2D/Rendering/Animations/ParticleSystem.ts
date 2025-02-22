import Updateable from "../../DataTypes/Interfaces/Updateable";
import Vec2 from "../../DataTypes/Vec2";
import { GraphicType } from "../../Nodes/Graphics/GraphicTypes";
import Particle from "../../Nodes/Graphics/Particle";
import Scene from "../../Scene/Scene";
import Timer from "../../Timing/Timer";
import Color from "../../Utils/Color";
import { EaseFunctionType } from "../../Utils/EaseFunctions";
import MathUtils from "../../Utils/MathUtils";
import RandUtils from "../../Utils/RandUtils";
import ParticleSystemManager from "./ParticleSystemManager";

export default class ParticleSystem implements Updateable {
    /** Pool for all particles */
    protected particlePool: Array<Particle>;

    /** Lifetime for each particle */
    protected lifetime: number;

    protected sourcePoint: Vec2;

    protected particleSize: Vec2;

    /** Timer for how long a particle system lasts before being turned off */
    protected systemLifetime: Timer;

    protected systemRunning: boolean;

    protected color: Color = new Color(255, 0, 0);

    /** Particles that can be rendered per frame */
    protected particlesPerFrame: number;

    /** Total number of particles to render, this will be incremented overtime by particlesPerFrame */
    protected particlesToRender: number;

    protected particleMass: number;

    /**
     * Construct a particle system
     * 
     * @param poolSize The pool size, i.e the total number of particles that will be created
     * @param sourcePoint The initial source point each particle will start at when the system is running, can be changed
     * @param lifetime Lifetime of each particle before they are set inactive
     * @param size Size of each particle
     * @param mass Initial mass of each particle, can be changed
     * @param maxParticlesPerFrame Total number of particles that can be created during a given frame.
     */
    constructor(poolSize: number, sourcePoint: Vec2, lifetime: number, size: number, mass: number, maxParticlesPerFrame: number) {
        this.particlePool = new Array(poolSize);
        this.sourcePoint = sourcePoint;
        this.lifetime = lifetime;
        this.particleSize = new Vec2(size, size);
        this.systemRunning = false;
        this.particlesPerFrame = maxParticlesPerFrame;
        this.particlesToRender = this.particlesPerFrame;
        this.particleMass = mass;

        ParticleSystemManager.getInstance().registerParticleSystem(this);
    }

    /** Initialize the pool of all particles, creating the assets in advance */
    initializePool(scene: Scene, layer: string) {
        for (let i = 0; i < this.particlePool.length; i++) {
            this.particlePool[i] = <Particle>scene.add.graphic(GraphicType.PARTICLE, layer,
                { position: this.sourcePoint.clone(), size: this.particleSize.clone(), mass: this.particleMass });
            this.particlePool[i].addPhysics();
            this.particlePool[i].isCollidable = false;
            this.particlePool[i].visible = false;
        }
    }

    /**
     * Start up the particle system to run for a set amount of time
     * @param time Time for the particle systme to run
     * @param mass Optional change of mass for each particle
     * @param startPoint Optional change of start position for each particle
     */
    startSystem(time: number, mass?: number, startPoint?: Vec2) {
        //Stop the system to reset all particles
        this.stopSystem();

        //Set the timer
        this.systemLifetime = new Timer(time);

        //Update optional parameters
        if (mass !== undefined)
            this.particleMass = mass;

        if (startPoint !== undefined)
            this.sourcePoint = startPoint;

        //Start the timer, set flags, and give the initial amount of particles to render
        this.systemLifetime.start();
        this.systemRunning = true;
        this.particlesToRender = this.particlesPerFrame;
    }

    stopSystem() {
        this.systemRunning = false;
        for (let particle of this.particlePool) {
            if (particle.inUse) {
                particle.setParticleInactive();
            }
        }
    }

    changeColor(color: Color) {
        this.color = color;
    }

    /**
     * Default implementation of setParticleAnimation, no tween animations occur, but each particle is given a random
     * velocity. It's encouraged for you to override this function and implement your own tween animations.
     * 
     * @param particle 
     */
    setParticleAnimation(particle: Particle) {
        particle.vel = RandUtils.randVec(-50, 50, -100, 100);
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
            effects: []
        });
    }

    update(deltaT: number) {
        // Exit if the system isn't currently running
        if (!this.systemRunning) {
            return;
        }
        // Stop the system if our timer is up
        if (this.systemLifetime.isStopped()) {
            this.stopSystem();
        }
        else {
            for (let i = 0; i < this.particlesToRender; i++) {
                let particle = this.particlePool[i];

                // If a particle is in use, decrease it's age and update it's velocity, if it has one
                if (particle.inUse) {
                    particle.decrementAge(deltaT * 1000);

                    if (particle.age <= 0) {
                        particle.setParticleInactive();
                    }
                    //add accell

                    //Add to the velocity
                    //particle.vel.y += ;
                    //this.particleMass
                    //__________________________________________________
                    particle.vel.y += (this.particleMass*10);
                    




                    //___________________________________________

                    particle.move(particle.vel.scaled(deltaT));
                }
                else {
                    // Set the particle to active
                    particle.setParticleActive(this.lifetime, this.sourcePoint.clone());

                    // Update particle color, mass, and alpha
                    particle.color = this.color;
                    particle.alpha = 1;
                    particle.mass = this.particleMass;
                    
                    // Give particle tween animations
                    this.setParticleAnimation(particle);

                    particle.tweens.play("active");
                }
            }
            // Update the amount of particles that can be rendered based on the particles per frame, clamping if we go over the total number
            // of particles in our pool
            this.particlesToRender = MathUtils.clamp(this.particlesToRender+this.particlesPerFrame, 0, this.particlePool.length);
        }
    }

}
