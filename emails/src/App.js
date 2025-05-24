import axios from "axios";
import Router from "./router/router";

function App() {
  const handlelogin = async () =>{
    var res = await axios.get("http://localhost:3001/");
    window.location.href=res.data.url;
  }
  return ( 
    <div className="App">
      <Router/>
    </div>
  );
}

export default App;
