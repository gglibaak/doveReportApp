'use client';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import io from 'socket.io-client';

function Home() {
  interface blockedPersons {
    name: string;
    dni: string;
    sex: string;
    reason: string;
    ts: Date;
  }
  interface RegisterItem {
    totalEntered: number;
    totalScanned: number;
    totalBlocked: number;
    totalAllowed: number;
    blockedPersons?: blockedPersons[];
  }

  interface EventData {
    eventName: string;
    eventPlace: string;
    eventDate: string;
    eventTime: string;
  }

  const [report, setReport] = useState<RegisterItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [previousReport, setPreviousReport] = useState<RegisterItem[]>([]);
  const [eventData, setEventData] = useState<EventData[]>([]);

  const getInitialDataReport = async () => {
    try {
      const response = await fetch(`http://localhost:8083/api/accesscontrol/identity/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventCode: '7CJXT5YCGHDQL19SL3R8P2H4OQ33FF' }),
      });
      const data = await response.json();

      if (data.status === 'success' && data.payload) {
        const { eventName, eventPlace, eventDate, eventTime } = data.payload;
        setEventData([{ eventName, eventPlace, eventDate, eventTime }]);
      }
      if (data.status === 'success' && data.payload.result) {
        const { totalAllowed, totalEntered, totalBlocked, totalScanned, blockedPersons } = data.payload.result;
        setReport([{ totalAllowed, totalEntered, totalBlocked, totalScanned, blockedPersons }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getInitialDataReport();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:8083');
    setPreviousReport(report);

    // socket.on('connection', () => {
    //   console.log('Conectado al servidor');
    // });

    // socket.on('disconnect', () => {
    //   console.log('Desconectado del servidor');
    // });

    socket.on('reportList', data => {
      if (Array.isArray(data)) {
        setReport(data);
      } else {
        setReport([data]);
      }
      // console.log('Registrado', data);
    });

    // Limpia la conexión cuando el componente se desmonta
    return () => {
      socket.disconnect();
    };
  }, [report]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getCellClass = (currentValue: number, previousValue: number) => {
    return currentValue !== previousValue ? 'fade-in' : 'fade-out';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {eventData.map(item => item.eventName)} - {eventData.map(item => item.eventDate)} -{' '}
        {eventData.map(item => item.eventTime)}
      </h1>
      <h3 className="text-2xl font-bold mb-4 text-center">{eventData.map(item => item.eventPlace)}</h3>
      <div className="mt-4 p-4 bg-gray-300 dark:bg-gray-800 overflow-x-auto">
        <h2 className="text-xl font-bold mb-2">Reporte de Admision</h2>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Ingresados
              </th>
              <th scope="col" className="px-6 py-3">
                Reingresados
              </th>
              <th scope="col" className="px-6 py-3">
                Lista Negra
              </th>
              <th scope="col" className="px-6 py-3">
                Total de Scaneos
              </th>
            </tr>
          </thead>
          <tbody>
            {report.map((item, index) => (
              <tr key={index} className="bg-gray-100 dark:bg-gray-700">
                <td className={`px-6 py-4 ${getCellClass(item?.totalAllowed, previousReport[index]?.totalAllowed)}`}>
                  {item?.totalAllowed}
                </td>
                <td className={`px-6 py-4 ${getCellClass(item?.totalEntered, previousReport[index]?.totalEntered)}`}>
                  {item?.totalEntered}
                </td>
                <td className={`px-6 py-4 ${getCellClass(item?.totalBlocked, previousReport[index]?.totalBlocked)}`}>
                  {item?.totalBlocked ?? '0'}
                </td>
                <td className={`px-6 py-4 ${getCellClass(item?.totalScanned, previousReport[index]?.totalScanned)}`}>
                  {item?.totalScanned}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report.map(
        (item, index) =>
          item.totalBlocked > 0 && (
            <div key={index} className="mt-4 p-4 bg-gray-300 dark:bg-gray-800 overflow-x-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold mb-2">Personas Bloqueadas</h2>
                <button onClick={toggleCollapse} className="focus:outline-none">
                  {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>
              </div>
              {!isCollapsed && (
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3">
                        DNI
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Sexo
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Razon
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.blockedPersons?.map((person, index) => (
                      <tr key={index} className="bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4">{person.name}</td>
                        <td className="px-6 py-4">{person.dni}</td>
                        <td className="px-6 py-4">{person.sex}</td>
                        <td className="px-6 py-4">{person.reason}</td>
                        <td className="px-6 py-4">{moment(person.ts).format('HH:mm:ss')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ),
      )}
    </div>
  );
}

export default Home;
