export const testNavigation = () => {
    console.log('🧪 Testing Navigation...')

    // Test current location
    console.log('📍 Current location:', window.location.pathname)
    console.log('🔗 Current URL:', window.location.href)

    // Test history
    console.log('📚 History length:', window.history.length)

    // Test localStorage
    console.log('💾 LocalStorage items:')
    Object.keys(localStorage).forEach(key => {
        console.log(`   ${key}:`, localStorage.getItem(key))
    })

    // Test sessionStorage
    console.log('💾 SessionStorage items:')
    Object.keys(sessionStorage).forEach(key => {
        console.log(`   ${key}:`, sessionStorage.getItem(key))
    })

    // Test DOM elements
    console.log('🏗️ DOM Elements:')
    console.log('   - Sidebar:', !!document.querySelector('[class*="sidebar"]'))
    console.log('   - Main content:', !!document.querySelector('main'))
    console.log('   - Outlet:', !!document.querySelector('[data-testid="outlet"]'))

    return {
        pathname: window.location.pathname,
        historyLength: window.history.length,
        hasSidebar: !!document.querySelector('[class*="sidebar"]'),
        hasMainContent: !!document.querySelector('main')
    }
}

export const testRouteChange = (fromPath, toPath) => {
    console.log(`🔄 Route change test: ${fromPath} → ${toPath}`)

    // Simulate route change
    const currentPath = window.location.pathname
    console.log('📍 Current path:', currentPath)
    console.log('🎯 Target path:', toPath)

    // Test if navigation is possible
    if (currentPath !== toPath) {
        console.log('✅ Navigation should be possible')
        return true
    } else {
        console.log('⚠️ Already on target path')
        return false
    }
} 