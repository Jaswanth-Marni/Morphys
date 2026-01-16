// Lazy-loaded full code for components
// This file is dynamically imported only when "Full Code" tab is clicked
// Reduces initial bundle size by ~100KB+

export const componentFullCode: Record<string, () => Promise<string>> = {};

// Helper to dynamically import full code
export async function getFullCode(componentId: string): Promise<string> {
    // Import the main components data lazily for full code
    const { componentsData } = await import('./componentsData');
    const component = componentsData.find(c => c.id === componentId);
    return component?.fullCode || '// Code not found';
}
