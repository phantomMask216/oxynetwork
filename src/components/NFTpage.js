import Navbar from "./Navbar";
import {  useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import loadinggif from "./loading2.gif";
import "@google/model-viewer/dist/model-viewer";



export default function NFTPage (props) {


    const sampleData1 = 
        {
            "name": "NFT 1",
            "description": "First 3D NFT",
            "image":"https://obdyqwaozpesveqoazrp.supabase.co/storage/v1/object/public/oxy/reflective-sphere.gltf",
            "price":"10",
            "currentlySelling":"True",
            "owner":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            "seller":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        };

        const sampleData2 = 
        {
            "name": "NFT 2",
            "description": "First 3D NFT",
            "image":"https://obdyqwaozpesveqoazrp.supabase.co/storage/v1/object/public/oxy/Astronaut.glb",
            "price":"10",
            "currentlySelling":"True",
            "owner":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            "seller":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        };

    

const params = useParams();
const tokenId = params.tokenId;




const [data, updateData] = useState(tokenId=="sampleData1"?sampleData1:sampleData2);
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    const tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    let meta = await axios.get(tokenURI);
    meta = meta.data;

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    updateData(item);
    updateDataFetched(true);
    updateCurrAddress(addr);
}





async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert( "Something went wrong,\nPlease connect your metamask wallet and Reload the page" )
    }
}




    if(!dataFetched && tokenId!="sampleData1"){
        getNFTData(tokenId);
    }
    if(!dataFetched && tokenId!="sampleData2"){
        getNFTData(tokenId);}


  

    return(
        <div>

            <Navbar></Navbar>

            <div  className=" flex  mt-5 justify-around flex-wrap max-w-screen-xl">
            <div>
            <model-viewer style={{"height": "500px",}}
        src={data.image}
        poster={loadinggif}
        ios-src=""
        alt="A 3D model of an astronaut"
        shadow-intensity="1"
        camera-controls
        auto-rotate
        ar
      ></model-viewer></div>
                <div className="text-xl space-y-8 text-white border-2  rounded-lg  w-49 md:w-71 shadow-2xl  p-5">
                    <div >
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                    { currAddress == data.owner || currAddress == data.seller ?
                         <div className="text-emerald-700">You are the owner of this NFT</div>:<button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                         
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}