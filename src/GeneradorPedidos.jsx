
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function GeneradorPedidos() {
  const [corridas, setCorridas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [resultado, setResultado] = useState([]);

  const handleCorridasUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setCorridas(json);
    };
    reader.readAsBinaryString(file);
  };

  const handlePedidosUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setPedidos(json);
    };
    reader.readAsBinaryString(file);
  };

  const generarSKUs = () => {
    const tallas = [23,24,25,26,27,28,29,30];
    const resumen = {};

    pedidos.forEach(pedido => {
      const fila = corridas.find(row =>
        String(row.PEDIDO).toUpperCase() === String(pedido.PEDIDO).toUpperCase() &&
        String(row.MODELO).toUpperCase() === String(pedido.MODELO).toUpperCase() &&
        String(row.COLOR).toUpperCase() === String(pedido.COLOR).toUpperCase()
      );

      if (!fila) return;

      const cajas = Number(pedido.CAJAS || 0);
      tallas.forEach(talla => {
        const cantidad = parseInt(fila[talla] === '-' ? 0 : fila[talla] || 0);
        const sku = `${pedido.MODELO}-${pedido.COLOR}-${talla}-MX`;
        const total = cantidad * cajas;

        if (total > 0) {
          resumen[sku] = (resumen[sku] || 0) + total;
        }
      });
    });

    const resultadoFinal = Object.entries(resumen).map(([sku, cantidad]) => ({ sku, cantidad }));
    setResultado(resultadoFinal);
  };

  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(resultado);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultado");
    XLSX.writeFile(workbook, "skus_pedidos_generados.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Generador de SKUs por múltiples pedidos</h2>

      <div style={{ marginBottom: 10 }}>
        <p><strong>1. Subir archivo de corridas</strong> (con columnas PEDIDO, MODELO, COLOR, 23–30):</p>
        <input type="file" accept=".xlsx" onChange={handleCorridasUpload} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <p><strong>2. Subir archivo de pedidos</strong> (con columnas PEDIDO, MODELO, COLOR, CAJAS):</p>
        <input type="file" accept=".xlsx" onChange={handlePedidosUpload} />
      </div>

      <button onClick={generarSKUs} style={{ marginBottom: 20 }}>Generar SKUs</button>

      {resultado.length > 0 && (
        <div>
          <h3>Resultado</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr><th>SKU</th><th>Cantidad</th></tr>
            </thead>
            <tbody>
              {resultado.map((r, i) => (
                <tr key={i}><td>{r.sku}</td><td>{r.cantidad}</td></tr>
              ))}
            </tbody>
          </table>
          <button onClick={exportarExcel} style={{ marginTop: 10 }}>Exportar Excel</button>
        </div>
      )}
    </div>
  );
}
