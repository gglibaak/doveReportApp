'use client'
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

function Home() {

interface blockedPersons{

    name: string;
    dni: string;
    reason: string;
    ts: Date;

}
interface RegisterItem {
  device?: string;
  deviceModel?: string;
  dni?: string
  name?: string
  birthDay?: string
  totalEntered: number
  totalScanned: number
  totalBlocked: number
  blockedPersons?: blockedPersons[]

}

const [register, setRegister] = useState<RegisterItem[]>([]);
  useEffect(() => {
    const socket = io('http://localhost:8083');

    socket.on('connection', () => {
      console.log('Conectado al servidor');
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
    });

    socket.on('dni', (data) => {
        if (Array.isArray(data)) {
          setRegister(data);
        } else {
          setRegister([data]);
        }
        console.log('Registrado', data);
      });

    // Limpia la conexión cuando el componente se desmonta
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
        Home
        <ul>
        {register.map((item, index) => (
          <li key={index}>
            Ingresa por el dispositivo:{item.device} el DUEÑO de eden {item.name} con DNI {item.dni} y fecha de nacimiento {item.birthDay}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;