import React from 'react';
import TodoList from '../Containers/TodoList'
import AddTodo from '../Containers/AddTodo'
//import Favicon from 'react-favicon';
//import faviconUrl from './Assets/favicon.ico';

let App = () =>
  (
    <div>
      <AddTodo />
      <TodoList />
    </div>
  )


export default App
// export default class App extends React.Component {
//   render() {
//     return (<div>
//       <Header />
//       <Content />
//       <Favicon url={faviconUrl} />
//     </div>);
//   }
// }