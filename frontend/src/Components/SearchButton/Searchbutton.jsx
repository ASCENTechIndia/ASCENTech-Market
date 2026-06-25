import React from 'react';
import './Searchbutton.css';

const Searchbutton = () => {
  return (
    <div className="container-fluid"> {/* Bootstrap container for responsiveness */}
      <div className="row justify-content-center">
        <div className="col-auto"> {/* Adjust width automatically */}
          <button className="shodha-button">शोधा</button>
        </div>
      </div>
    </div>
  );
};

export default Searchbutton;
