
'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { SearchableOption } from '../lib/types';

interface SearchableSelectProps {
  endpoint: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  endpoint,
  value,
  onValueChange,
  placeholder = 'Seleccionar...',
  emptyMessage = 'No se encontraron resultados',
  className,
  disabled = false,
}: SearchableSelectProps) {
  // HOOKS FIJOS: Siempre se llaman en el mismo orden
  const [options, setOptions] = useState<SearchableOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efecto para cargar las opciones - SIN useCallback para evitar dependencias complejas
  useEffect(() => {
    if (!mounted || !endpoint) return;

    let isCancelled = false;
    
    async function fetchOptions() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${endpoint}?limit=100`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (isCancelled) return;

        let data: any = null;
        
        try {
          const text = await response.text();
          if (!text || text.trim() === '') {
            data = [];
          } else {
            data = JSON.parse(text);
          }
        } catch (parseError) {
          console.warn('Error parsing JSON:', parseError);
          if (!isCancelled) {
            setOptions([]);
            setError('Error de formato en respuesta');
          }
          return;
        }

        if (!Array.isArray(data)) {
          console.warn('API response is not an array:', data);
          if (!isCancelled) {
            setOptions([]);
            if (response.status === 401) {
              setError('Sin autorización');
            } else {
              setError('Formato de respuesta inválido');
            }
          }
          return;
        }

        // Filtrar opciones válidas
        const safeOptions: SearchableOption[] = [];
        
        for (const item of data) {
          if (
            item &&
            typeof item === 'object' &&
            item.id &&
            item.nombre &&
            typeof item.id === 'string' &&
            typeof item.nombre === 'string' &&
            item.id.trim() !== '' &&
            item.nombre.trim() !== ''
          ) {
            safeOptions.push({
              id: String(item.id).trim(),
              nombre: String(item.nombre).trim()
            });
          }
        }

        if (!isCancelled) {
          setOptions(safeOptions);
        }
        
      } catch (fetchError) {
        console.warn('Fetch error:', fetchError);
        if (!isCancelled) {
          setOptions([]);
          setError('Error de conexión');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchOptions();

    return () => {
      isCancelled = true;
    };
  }, [endpoint, mounted]);

  // Función para manejar el cambio de valor - SIN useCallback
  const handleValueChange = (newValue: string) => {
    try {
      if (newValue && typeof newValue === 'string' && newValue.trim() !== '' && newValue !== value) {
        onValueChange(newValue);
      }
    } catch (error) {
      console.warn('Error handling value change:', error);
    }
  };

  // Buscar opción seleccionada - SIN useMemo
  let selectedOption = null;
  if (value && Array.isArray(options)) {
    try {
      selectedOption = options.find(option => option?.id === value) || null;
    } catch (error) {
      console.warn('Error finding selected option:', error);
    }
  }

  // Render con protección de hidratación
  if (!mounted) {
    return (
      <Button
        variant="outline"
        className={cn('justify-between', className)}
        disabled={true}
      >
        {placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Select 
      value={value || ''} 
      onValueChange={handleValueChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder}>
          {selectedOption?.nombre || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {loading && (
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Cargando...
          </div>
        )}
        
        {error && !loading && (
          <div className="flex items-center justify-center p-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
        
        {!loading && !error && (!options || options.length === 0) && (
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
        
        {!loading && !error && Array.isArray(options) && options.length > 0 && (
          <>
            {options.map((option) => {
              if (!option || !option.id || !option.nombre) {
                return null;
              }
              
              return (
                <SelectItem 
                  key={option.id} 
                  value={option.id}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.nombre}
                  </div>
                </SelectItem>
              );
            })}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
