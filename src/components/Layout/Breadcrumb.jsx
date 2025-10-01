import React from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const Breadcrumb = () => {
  const location = useLocation()
  
  // Define breadcrumb mapping based on routes
  const getBreadcrumbs = (pathname) => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // First segment determines role
    if (segments[0] === 'owner') {
      breadcrumbs.push({ label: 'Owner', path: '/owner' })
    } else if (segments[0] === 'admin') {
      breadcrumbs.push({ label: 'Admin', path: '/admin' })
    }
    
    // Map common segments
    const segmentMap = {
      'keuangan': 'Keuangan',
      'operasional': 'Operasional', 
      'tugas': 'Tugas',
      'poskas': 'Poskas',
      'omset-harian': 'Omset Harian',
      'aneka-grafik': 'Aneka Grafik',
      'data-supplier': 'Data Supplier',
      'data-aset': 'Data Aset',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'chat': 'Chat'
    }
    
    // Build breadcrumb path
    let currentPath = `/${segments[0]}`
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      
      // Skip detail/edit/add pages in breadcrumb display
      if (['detail', 'edit', 'add', 'form'].includes(segment)) {
        continue
      }
      
      const label = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ label, path: currentPath })
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs(location.pathname)
  
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className={index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : 'text-gray-600'}>
            {crumb.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

export default Breadcrumb
