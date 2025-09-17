import { useState, useEffect } from "react";

/**
 * Un hook personalizado para cargar dinámicamente un script externo.
 * @param {string} src - La URL del script a cargar.
 * @returns {{loading: boolean, error: Error | null}} El estado de carga y error del script.
 */
export function useScript(src) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Evitar añadir el script si ya existe en el DOM
    let script = document.querySelector(`script[src="${src}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);

      const handleLoad = () => setLoading(false);
      const handleError = (error) => setError(error);

      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);

      // Función de limpieza para eliminar el script y los listeners si el componente se desmonta
      return () => {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
        // Opcional: podrías decidir no eliminar el script para que no se recargue entre navegaciones
        // document.body.removeChild(script);
      };
    } else {
      // Si el script ya estaba, asumimos que está cargado o cargándose.
      setLoading(false);
    }
  }, [src]); // El efecto se vuelve a ejecutar si la URL del script cambia

  return { loading, error };
}
