# AgroShield UI Security Guide

## Overview

Security considerations and best practices for the AgroShield UI component library to ensure safe and secure implementation in production applications.

## 🔒 Security Principles

### Defense in Depth
- Multiple layers of security
- Input validation at all levels
- Secure defaults
- Minimal attack surface

### Least Privilege
- Only necessary permissions
- Minimal data exposure
- Secure by default
- Explicit opt-in for features

### Secure by Design
- Security built from the ground up
- Threat modeling
- Security reviews
- Regular audits

## 🛡️ Component Security

### Input Validation
```tsx
// Secure input component with validation
interface SecureInputProps {
  value: string
  onChange: (value: string) => void
  validation?: ValidationRule[]
  sanitize?: boolean
}

const SecureInput: React.FC<SecureInputProps> = ({
  value,
  onChange,
  validation,
  sanitize = true
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value
    
    // Sanitize input if enabled
    if (sanitize) {
      newValue = sanitizeInput(newValue)
    }
    
    // Validate against rules
    if (validation && !validateInput(newValue, validation)) {
      return // Don't update if validation fails
    }
    
    onChange(newValue)
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      aria-invalid={validation && !validateInput(value, validation)}
    />
  )
}

// Input sanitization function
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove JavaScript URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}
```

### XSS Prevention
```tsx
// Safe HTML rendering
import DOMPurify from 'dompurify'

interface SafeHTMLProps {
  html: string
  className?: string
}

const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className }) => {
  const sanitizedHTML = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    })
  }, [html])

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}

// Safe tooltip content
const SafeTooltip: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })
  }, [content])

  return <Tooltip content={sanitizedContent} />
}
```

### CSRF Protection
```tsx
// Secure form component with CSRF token
interface SecureFormProps {
  onSubmit: (data: FormData) => void
  csrfToken: string
  children: React.ReactNode
}

const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  csrfToken,
  children
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const formData = new FormData(event.currentTarget)
    
    // Verify CSRF token
    if (formData.get('csrf_token') !== csrfToken) {
      console.error('CSRF token mismatch')
      return
    }
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  )
}
```

## 🔐 Authentication & Authorization

### Secure Authentication UI
```tsx
// Secure login form
interface SecureLoginFormProps {
  onLogin: (credentials: LoginCredentials) => void
  isLoading?: boolean
  error?: string
}

const SecureLoginForm: React.FC<SecureLoginFormProps> = ({
  onLogin,
  isLoading,
  error
}) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    // Validate credentials
    if (!validateEmail(credentials.email) || !credentials.password) {
      return
    }
    
    onLogin(credentials)
  }

  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            required
            autoComplete="email"
            aria-describedby="email-error"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            required
            autoComplete="current-password"
            minLength={8}
            aria-describedby="password-error"
          />
        </div>

        {error && (
          <Alert variant="destructive" id="form-error">
            {error}
          </Alert>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  )
}
```

### Role-Based Access Control
```tsx
// Secure component with role-based access
interface SecureComponentProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: string
  fallback?: React.ReactNode
}

const SecureComponent: React.FC<SecureComponentProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = null
}) => {
  const { user } = useAuth()

  const hasAccess = useMemo(() => {
    if (!user) return false
    
    if (requiredRole && user.role !== requiredRole) return false
    if (requiredPermission && !user.permissions.includes(requiredPermission)) return false
    
    return true
  }, [user, requiredRole, requiredPermission])

  if (!hasAccess) return fallback

  return <>{children}</>
}

// Usage example
<SecureComponent requiredRole="admin" fallback={<AccessDenied />}>
  <AdminPanel />
</SecureComponent>
```

## 🔍 Data Protection

### Sensitive Data Handling
```tsx
// Secure data display component
interface SecureDataProps {
  data: SensitiveData
  showSensitive?: boolean
  maskFunction?: (data: string) => string
}

const SecureData: React.FC<SecureDataProps> = ({
  data,
  showSensitive = false,
  maskFunction = defaultMaskFunction
}) => {
  const displayValue = useMemo(() => {
    if (showSensitive) return data.value
    
    return maskFunction(data.value)
  }, [data.value, showSensitive, maskFunction])

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">{data.label}</h3>
      <p className="text-2xl font-mono">{displayValue}</p>
      {!showSensitive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSensitive(true)}
          className="mt-2"
        >
          Reveal sensitive data
        </Button>
      )}
    </div>
  )
}

// Default masking function
const defaultMaskFunction = (value: string): string => {
  if (value.length <= 4) return '****'
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2)
}
```

### Secure File Upload
```tsx
// Secure file upload component
interface SecureFileUploadProps {
  onUpload: (file: File) => Promise<void>
  allowedTypes?: string[]
  maxSize?: number
  scanForMalware?: boolean
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onUpload,
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize = 5 * 1024 * 1024, // 5MB
  scanForMalware = true
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed')
      }

      // Validate file size
      if (file.size > maxSize) {
        throw new Error('File size exceeds limit')
      }

      // Scan for malware (mock implementation)
      if (scanForMalware) {
        const isClean = await scanFileForMalware(file)
        if (!isClean) {
          throw new Error('File failed security scan')
        }
      }

      setUploading(true)
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        onChange={handleFileSelect}
        accept={allowedTypes.join(',')}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Allowed types: {allowedTypes.join(', ')}
          </p>
        </div>
      </label>

      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}

      {uploading && (
        <div className="mt-4">
          <Progress value={75} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">Uploading and scanning...</p>
        </div>
      )}
    </div>
  )
}
```

## 🌐 Network Security

### Secure API Integration
```tsx
// Secure API client with authentication
interface SecureAPIClientProps {
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

const useSecureAPI = <T = any>(props: SecureAPIClientProps) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get auth token
      const token = await getAuthToken()
      
      // Prepare secure headers
      const secureHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': getCSRFToken(),
        ...props.headers
      }

      // Make secure request
      const response = await fetch(props.endpoint, {
        method: props.method || 'GET',
        headers: secureHeaders,
        body: props.body ? JSON.stringify(props.body) : undefined,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [props])

  return { data, loading, error, execute }
}
```

### Rate Limiting UI
```tsx
// Rate limiting component
interface RateLimitedButtonProps {
  onAction: () => Promise<void>
  maxRequests?: number
  windowMs?: number
  children: React.ReactNode
}

const RateLimitedButton: React.FC<RateLimitedButtonProps> = ({
  onAction,
  maxRequests = 5,
  windowMs = 60000, // 1 minute
  children
}) => {
  const [requestCount, setRequestCount] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const handleClick = async () => {
    if (blocked) return

    try {
      await onAction()
      setRequestCount(prev => prev + 1)
    } catch (err) {
      console.error('Action failed:', err)
    }
  }

  // Check rate limit
  useEffect(() => {
    if (requestCount >= maxRequests) {
      setBlocked(true)
      setTimeRemaining(windowMs / 1000)

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setBlocked(false)
            setRequestCount(0)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [requestCount, maxRequests, windowMs])

  return (
    <Button onClick={handleClick} disabled={blocked}>
      {children}
      {blocked && (
        <span className="ml-2 text-sm">
          (Rate limited: {timeRemaining}s)
        </span>
      )}
    </Button>
  )
}
```

## 🔒 Content Security Policy

### CSP-Compatible Components
```tsx
// CSP-compatible tooltip (no inline styles)
const CSPTOOLTIP = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Use CSS classes instead of inline styles
  const tooltipClasses = cn(
    'absolute z-50 px-2 py-1 text-sm bg-gray-900 text-white rounded',
    'transition-opacity duration-200',
    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
  )

  return (
    <div className="relative inline-block">
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {content}
      </div>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
    </div>
  )
}

// Safe dynamic imports for CSP
const DynamicComponent = lazy(() => 
  import('./component').then(module => ({
    default: module.Component
  }))
)
```

## 🛡️ Error Handling & Logging

### Secure Error Reporting
```tsx
// Secure error boundary
interface SecureErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class SecureErrorBoundary extends React.Component<
  SecureErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: SecureErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitize error data before reporting
    const sanitizedError = {
      message: error.message,
      stack: error.stack?.replace(/\/.*\//g, '/**/'), // Remove file paths
      componentStack: errorInfo.componentStack?.replace(/\/.*\//g, '/**/'),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100) // Truncate user agent
    }

    // Report to secure logging service
    reportError(sanitizedError)
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

// Secure error reporting function
const reportError = async (errorData: any) => {
  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Reporting': 'true'
      },
      body: JSON.stringify(errorData)
    })
  } catch (err) {
    console.error('Failed to report error:', err)
  }
}
```

## 📋 Security Checklist

### Development Checklist
- [ ] Input validation implemented
- [ ] XSS prevention measures in place
- [ ] CSRF tokens used for forms
- [ ] Secure authentication flows
- [ ] Role-based access control
- [ ] Sensitive data masked
- [ ] File upload security
- [ ] Rate limiting implemented
- [ ] CSP compatibility
- [ ] Secure error handling

### Production Checklist
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Subresource Integrity (SRI)
- [ ] Content Security Policy
- [ ] Regular security audits
- [ ] Dependency vulnerability scans
- [ ] Penetration testing
- [ ] Monitoring and logging

## 🔧 Security Configuration

### Headers Configuration
```typescript
// Security headers for Next.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
]
```

## 📚 Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [React Security](https://react.dev/learn/scaling-up-reducer#security)

### Tools
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [Dependabot](https://github.com/dependabot)

### Testing
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)
- [Security Headers Test](https://securityheaders.com/)

---

By following this security guide, you can ensure that your AgroShield UI applications are secure and protected against common web vulnerabilities.
