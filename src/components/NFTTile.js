import "@google/model-viewer/dist/model-viewer";
import loadinggif from "./loading2.gif";




import {
    BrowserRouter as Router,
    useNavigate 
  } from "react-router-dom";

function NFTTile (data) {

 
    const navigate = useNavigate()
    return (
        
        
            
        <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg  w-47 md:w-71 shadow-2xl">
        <button  onDoubleClick ={() => navigate("/nftPage/"+data.data.tokenId)}>
        <model-viewer  style={{"height": "190px",}}
        src={data.data.image}
        poster={loadinggif}
        ios-src=""
        alt="A 3D model of an astronaut"
        shadow-intensity="1"
        camera-controls
        auto-rotate
        ar
      >          
      </model-viewer>
      
      </button>
            <div className= "text-white w-full p-10  rounded-lg pt-5 -mt-20">
                <p className="display-inline">
                    {data.data.name}
                </p>
            </div>
            
        </div>
      
        
    )
}

export default NFTTile;
