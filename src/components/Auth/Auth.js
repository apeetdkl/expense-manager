import { useState } from "react";
import Register from "./Register";  // Import Register component
import Login from "./Login"; // Assuming there's a Login component

function Auth() {
  const [showRegister, setShowRegister] = useState(false); // State to toggle login/register

  return (
    <div className="container mx-auto p-4">
      {showRegister ? (
        <Register setShowRegister={setShowRegister} />
      ) : (
        <Login setShowRegister={setShowRegister} />
      )}
    </div>
  );
}

export default Auth;