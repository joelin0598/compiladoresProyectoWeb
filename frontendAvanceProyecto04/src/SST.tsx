import React, { useState } from 'react';
import axios from 'axios';

const SST: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultado, setResultado] = useState<string>('');
  const [erroresLexicos, setErroresLexicos] = useState<string[]>([]);
  const [erroresSintacticos, setErroresSintacticos] = useState<string[]>([]);
  const [errorGeneral, setErrorGeneral] = useState<string>('');

  const analizarCodigo = async () => {
    setLoading(true);
    resetearEstado();

    try {
  const response = await axios.post(
    'https://compiladoresproyectobackend-1.onrender.com/api/compilar',
    code,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );

  manejarRespuesta(response.data);
} catch (error) {
  setErrorGeneral('Error al conectar con el backend.');
} finally {
  setLoading(false);
}
  };

  const analizarArchivo = async () => {
    if (!file) return;

    setLoading(true);
    resetearEstado();

    const formData = new FormData();
    formData.append('archivo', file);

    try {
  const response = await axios.post(
    'https://compiladoresproyectobackend-1.onrender.com/api/compilar/archivo',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  manejarRespuesta(response.data);
} catch (error) {
  setErrorGeneral('Error al conectar con el backend.');
} finally {
  setLoading(false);
}
  };

  const manejarRespuesta = (data: any) => {
    if (data.status === 'ok') {
      setResultado(data.mensaje);
    } else {
      setErroresLexicos(data.erroresLexicos || []);
      setErroresSintacticos(data.erroresSintacticos || []);
      if (data.errorInterno) setErrorGeneral(data.errorInterno);
    }
  };

  const resetearEstado = () => {
    setResultado('');
    setErroresLexicos([]);
    setErroresSintacticos([]);
    setErrorGeneral('');
  };

  return (
    <div className="container mt-5">
      <h2>Analizador SimpleScript</h2>

      <div className="mb-3">
        <label className="form-label fw-bold">Código manual:</label>
        <textarea
          className="form-control"
          rows={8}
          placeholder="Escribe tu código aquí..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={analizarCodigo}
          disabled={loading || !code.trim()}
        >
          {loading ? 'Analizando...' : 'Analizar código'}
        </button>
      </div>

      <hr />

      <div className="mb-3">
        <label className="form-label fw-bold">Subir archivo (.ss o .txt):</label>
        <input
          type="file"
          className="form-control"
          accept=".ss,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          className="btn btn-secondary mt-2"
          onClick={analizarArchivo}
          disabled={loading || !file}
        >
          {loading ? 'Analizando archivo...' : 'Analizar archivo'}
        </button>
      </div>

      <hr />

      {resultado && (
        <div className="alert alert-success mt-3">
          ✅ <strong>{resultado}</strong>
        </div>
      )}

      {(erroresLexicos.length > 0 || erroresSintacticos.length > 0) && (
        <div className="alert alert-danger mt-3">
          <h5>Errores encontrados:</h5>
          {erroresLexicos.length > 0 && (
            <>
              <strong>Errores léxicos:</strong>
              <ul>
                {erroresLexicos.map((err, idx) => (
                  <li key={`lex-${idx}`}>{err}</li>
                ))}
              </ul>
            </>
          )}
          {erroresSintacticos.length > 0 && (
            <>
              <strong>Errores sintácticos:</strong>
              <ul>
                {erroresSintacticos.map((err, idx) => (
                  <li key={`syn-${idx}`}>{err}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {errorGeneral && (
        <div className="alert alert-warning mt-3">
          ⚠️ <strong>{errorGeneral}</strong>
        </div>
      )}
    </div>
  );
};

export default SST;
