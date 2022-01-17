import Moralis from "moralis";

const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const appId = process.env.REACT_APP_MORALIS_APP_ID;
Moralis.start({ serverUrl, appId });

let user = Moralis.User.current();
if (!user) {
  Moralis.authenticate().then(function (user) {
    console.log(`[Moralis] Authenticated ${user.get("ethAddress")}`);
  });
} else {
  console.log(`[Moralis] Authenticated ${user.get("ethAddress")}`);
}

export const uploadImageToIPFS = async (image) => {
  try {
    const data = image;
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS({ useMasterKey: true });
    const imageIpfsUrl = file.ipfs();
    console.log(`[Moralis] File uploaded to IPFS ${imageIpfsUrl}`);
    return imageIpfsUrl;
  } catch (err) {
    console.log(`[Moralis] Unable to upload file to IPFS ${err}`);
  }
};
