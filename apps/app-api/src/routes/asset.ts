import express from "express";

const AssetRouter = express.Router();

AssetRouter.get("/", (req, res) => {
    //from enginfe 


    return res.send("balance from engine")
});
