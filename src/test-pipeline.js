import { initPost, drawPost, getPipelineInfo } from './post/pipeline.js';
import { P } from './params.js';

/**
 * Simple test to verify the post-processing pipeline functionality.
 * This can be imported and called from the browser console.
 */
export function testPipeline() {
    console.log('Testing post-processing pipeline...');
    
    // Test initialization
    try {
        initPost(512, 512);
        console.log('✓ Pipeline initialized successfully');
    } catch (error) {
        console.error('✗ Pipeline initialization failed:', error);
        return false;
    }
    
    // Test pipeline info
    const info = getPipelineInfo();
    console.log('Pipeline info:', info);
    
    // Test with different effect combinations
    const testCases = [
        { name: 'No effects', params: { ...P, noiseEnabled: false, chromaEnabled: false, fbmEnabled: false } },
        { name: 'Distortion only', params: { ...P, noiseEnabled: true, chromaEnabled: false, fbmEnabled: false } },
        { name: 'Chroma only', params: { ...P, noiseEnabled: false, chromaEnabled: true, fbmEnabled: false } },
        { name: 'FBM only', params: { ...P, noiseEnabled: false, chromaEnabled: false, fbmEnabled: true } },
        { name: 'All effects', params: { ...P, noiseEnabled: true, chromaEnabled: true, fbmEnabled: true } }
    ];
    
    // Create a dummy graphics buffer for testing
    const dummyPg = createGraphics(256, 256);
    dummyPg.background(255, 0, 0); // Red background
    
    testCases.forEach(testCase => {
        console.log(`\nTesting: ${testCase.name}`);
        try {
            const result = drawPost(dummyPg, 0.5, testCase.params, 256, 256);
            if (result) {
                console.log(`✓ ${testCase.name} processed successfully`);
            } else {
                console.warn(`⚠ ${testCase.name} returned null/undefined`);
            }
        } catch (error) {
            console.error(`✗ ${testCase.name} failed:`, error);
        }
    });
    
    console.log('\nPipeline test completed!');
    return true;
}

// Make testPipeline available globally for browser console
window.testPipeline = testPipeline;
