import { useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import Lobby from './components/Lobby';
import Chat from './components/Chat';
import * as chatConstants from './chatConstants';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl(chatConstants.ApiURL)
        .configureLogging(LogLevel.Information)
        .build();

      connection.on(chatConstants.UsersInRoomMethod, (users) => {
        setUsers(users);
      });

      connection.on(chatConstants.ReceiveMessageMethod, (user, message) => {
        setMessages(messages => [...messages, { user, message }]);
      });

      connection.onclose(e => {
        setConnection();
        setMessages([]);
        setUsers([]);
      });

      await connection.start();
      await connection.invoke(chatConstants.JoinRoomMethod, { user, room });
      setConnection(connection);

    } catch (e) {
      console.log(e);
    }
  }

  const sendMessage = async (message) => {
    try {
      await connection.invoke(chatConstants.SendMessageMethod, message);
    } catch (e) {
      console.log(e);
    }
  }

  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className='app'>
      <h2>MyChat</h2>
      <hr className='line' />
      {!connection
        ? <Lobby joinRoom={joinRoom} />
        : <Chat messages={messages}
          sendMessage={sendMessage}
          closeConnection={closeConnection}
          users={users} />
      }
    </div>
  );
}

export default App;
