import { SOUND_JUMP, SOUND_HIT, SOUND_REACHED } from '../assets/sounds';

let audioJump, audioHit, audioReached;

export const initAudio = () => {
    if (typeof window !== 'undefined') {
        if (!audioJump) audioJump = new Audio(SOUND_JUMP);
        if (!audioHit) audioHit = new Audio(SOUND_HIT);
        if (!audioReached) audioReached = new Audio(SOUND_REACHED);
    }
};

export const playJump = () => {
    if (audioJump) {
        audioJump.currentTime = 0;
        audioJump.play().catch(()=>{});
    }
};

export const playDeath = () => {
    if (audioHit) {
        audioHit.currentTime = 0;
        audioHit.play().catch(()=>{});
    }
};

export const playMilestone = () => {
    if (audioReached) {
        audioReached.currentTime = 0;
        audioReached.play().catch(()=>{});
    }
};
