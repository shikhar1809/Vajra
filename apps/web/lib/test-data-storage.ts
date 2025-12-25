// LocalStorage keys for test data
const TEST_DATA_PREFIX = 'vajra_test_data_'
const TEST_DATA_FLAG = 'vajra_has_test_data'

export type ModuleName = 'shield' | 'aegis' | 'scout' | 'sentry' | 'team' | 'activity' | 'metrics'

// Save test data for a specific module
export function saveTestData(module: ModuleName, data: any): void {
    try {
        localStorage.setItem(`${TEST_DATA_PREFIX}${module}`, JSON.stringify(data))
        // Update flag to indicate test data exists
        const flags = getTestDataFlags()
        flags[module] = true
        localStorage.setItem(TEST_DATA_FLAG, JSON.stringify(flags))
    } catch (error) {
        console.error(`Error saving test data for ${module}:`, error)
    }
}

// Get test data for a specific module
export function getTestData<T = any>(module: ModuleName): T | null {
    try {
        const data = localStorage.getItem(`${TEST_DATA_PREFIX}${module}`)
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.error(`Error getting test data for ${module}:`, error)
        return null
    }
}

// Check if test data exists for a module
export function hasTestData(module: ModuleName): boolean {
    const flags = getTestDataFlags()
    return flags[module] === true
}

// Clear test data for a specific module
export function clearTestData(module: ModuleName): void {
    try {
        localStorage.removeItem(`${TEST_DATA_PREFIX}${module}`)
        // Update flag
        const flags = getTestDataFlags()
        delete flags[module]
        localStorage.setItem(TEST_DATA_FLAG, JSON.stringify(flags))
    } catch (error) {
        console.error(`Error clearing test data for ${module}:`, error)
    }
}

// Clear all test data
export function clearAllTestData(): void {
    try {
        const modules: ModuleName[] = ['shield', 'aegis', 'scout', 'sentry', 'team', 'activity', 'metrics']
        modules.forEach(module => {
            localStorage.removeItem(`${TEST_DATA_PREFIX}${module}`)
        })
        localStorage.removeItem(TEST_DATA_FLAG)
    } catch (error) {
        console.error('Error clearing all test data:', error)
    }
}

// Get all test data flags
function getTestDataFlags(): Record<string, boolean> {
    try {
        const flags = localStorage.getItem(TEST_DATA_FLAG)
        return flags ? JSON.parse(flags) : {}
    } catch (error) {
        return {}
    }
}

// Check if any test data exists
export function hasAnyTestData(): boolean {
    const flags = getTestDataFlags()
    return Object.values(flags).some(flag => flag === true)
}

// Get list of modules with test data
export function getModulesWithTestData(): ModuleName[] {
    const flags = getTestDataFlags()
    return Object.keys(flags).filter(key => flags[key] === true) as ModuleName[]
}
