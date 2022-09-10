import Navbar from "./Navbar";
import React, { useState } from "react";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";
import {createClient} from "@supabase/supabase-js";
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
// Construct with token and endpoint

const web3_token_id = process.env.REACT_APP_WEB_3_TOKEN;
const supabase_Url = process.env.REACT_APP_SUPABASE_URL;
const supabase_Key = process.env.REACT_APP_SUPABASE_KEY;

const client = new Web3Storage({ token: web3_token_id});

 const supabase = createClient(supabase_Url, supabase_Key)




export default function SellNFT () {
    const [disable, setDisable] = useState(true);
    const [textcolor, settextcolor] = useState(true);
    const [innertext, setInnertext] = useState("SELECT A GLB 3D FILE");
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e){



        try{
            
            setInnertext("  Processing...")
            settextcolor(false)

        var file = e.target.files[0];
        const time =  Date.now()
        const { data, error } = await supabase.storage
        .from('oxy')
        .upload(time+file.name, file)


        if(data){
            setDisable(false)
            setInnertext("List NFT")
            var url = "https://obdyqwaozpesveqoazrp.supabase.co/storage/v1/object/public/oxy/"+time+file.name
            setFileURL(url)
        }

        if(error){
            alert("Something went wrong")
        }

        }

        catch(e) {
            alert("Something went wrong")
        }
    
    
    };


    
 async function listNFT() {

    const obj = { hello: 'world' }
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
    const files = [
        new File([blob], 'data.json')
      ]

      
      const cid = await client.put(files)
      const link= "https://"+cid+".ipfs.w3s.link/data.json";
      return cid

}






    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL)
            return;

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            
            const blob = new Blob([JSON.stringify(nftJSON)], { type: 'application/json' })
            const files = [
                new File([blob], 'data.json')
              ]
              const cid = await client.put(files)
              const link= "https://"+cid+".ipfs.w3s.link/data.json";
              return link

        }
        catch(e) {
            alert("Something went wrong")
        }
    }


    
    async function listNFT(e) {



        e.preventDefault();

        //Upload data to IPFS
        try {
            setDisable(true)
            updateMessage("Please wait.. uploading (upto 5 mins)")
            const metadataURL = await uploadMetadataToIPFS();
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()

            alert("Successfully listed your NFT!");
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/")
        }
        catch(e) {
            updateMessage("");
            alert( "Something went wrong,\nPlease connect your metamask wallet and Reload the page" )
        }
    }

    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
            <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="OXY#1" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="OXY NETWORK" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image</label>
                    <input type={"file"} accept=".glb" onChange={OnChangeFile}></input>
                </div>
                <br></br>
                <div className="text-green text-center">{message}</div>
                <button onClick={listNFT} disabled={disable} style={{"color":textcolor ?  '#807977' : 'white' ,"backgroundColor": disable ?  '#CCC8C7' : '#9C27B0' }} className="btn font-bold mt-10 w-full text-white rounded p-2 shadow-lg" >
                {innertext}
                </button>
    
            </form>
        </div>
        </div>
    )
}