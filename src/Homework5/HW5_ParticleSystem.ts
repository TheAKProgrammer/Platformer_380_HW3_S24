import Particle from "../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../Wolfie2D/Rendering/Animations/ParticleSystem";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../Wolfie2D/Utils/RandUtils";

// HOMEWORK 5 - TODO
/**
 * This particle system extends the base ParticleSystem class, and I reccommend you look at some of the implementation, 
 * at least for the default setParticleAnimation()
 * 
 * You'll just be handling the tweens for each particle for their animation, overriding the base implementation.
 * 
 * The new particle animation add these behaviors, along with the existing setParticleAnimation behaviors:
 * 
 *  - Each particle should look like they're affected by gravity, accelerating down over the course of their lifetime. This
 *  change should also be affected by the particle's mass, meaning particles with a higher mass should fall faster.
 * 
 *  - Each particle should disappear over it's lifetime, moving from an alpha of 1 to 0.
 */
export default class HW5_ParticleSystem extends ParticleSystem {

    setParticleAnimation(particle: Particle) {
        super.setParticleAnimation(particle);
        //add other tweens alpha
        //lifetime
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
            effects: [{

                //property: TweenableProperties.alpha,
                property: "alpha",
                start: 1,
                end: 0,
                ease: EaseFunctionType.IN_OUT_QUAD
            }
                


            ]//set effect for alphq
        });
/*
        owner.tweens.add("death", {
            startDelay: 0,
            duration: lifetime,
            effects: [
                {
                    property: TweenableProperties.rotation,
                    start: 0,
                    end: 2*Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },

                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
                //add onEnd event string
            
                
            ]
        });

        */
    }

}