import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'

// Selector visual reutilizable que conserva el mismo contenido y comportamiento de un select nativo.
const AppSelect = forwardRef(function AppSelect(
  {
    children,
    className = '',
    id,
    value = '',
    onChange,
    'aria-label': ariaLabel,
    disabled = false,
    required = false,
  },
  forwardedRef,
) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const options = useMemo(() => {
    return Children.toArray(children)
      .filter((child) => isValidElement(child) && child.type === 'option')
      .map((option) => ({
        value: String(option.props.value ?? ''),
        label: option.props.children,
        disabled: Boolean(option.props.disabled),
      }))
  }, [children])

  const selectedOption =
    options.find((option) => option.value === String(value ?? '')) ||
    options[0]

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const selectValue = (nextValue, optionDisabled) => {
    if (disabled || optionDisabled) {
      return
    }

    onChange?.({
      target: {
        value: nextValue,
      },
    })

    setOpen(false)
  }

  const setButtonRef = (node) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(node)
    } else if (forwardedRef) {
      forwardedRef.current = node
    }
  }

  const handleTriggerKeyDown = (event) => {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div
      className={`app-select ${open ? 'app-select-open' : ''}`}
      ref={rootRef}
    >
      <button
        ref={setButtonRef}
        id={id}
        type="button"
        className={`app-select-trigger ${className} ${String(value ?? '') === '' ? 'app-select-placeholder' : ''}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="app-select-trigger-text">
          {selectedOption?.label}
        </span>

        <ChevronDown
          size={16}
          className="app-select-chevron"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="app-select-menu"
          role="listbox"
          aria-labelledby={id}
        >
          {options.map((option, index) => {
            const isSelected = option.value === String(value ?? '')

            return (
              <button
                key={`${option.value}-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`app-select-option ${isSelected ? 'app-select-option-selected' : ''}`}
                onClick={() => selectValue(option.value, option.disabled)}
              >
                <span>{option.label}</span>

                {isSelected && option.value !== '' && (
                  <Check size={15} aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

export default AppSelect
