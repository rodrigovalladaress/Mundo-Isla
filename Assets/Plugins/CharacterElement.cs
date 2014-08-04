using System;
using System.Collections.Generic;
using UnityEngine;
using Object=UnityEngine.Object;

// When analyzing the available assets UpdateCharacterElementDatabase creates
// a CharacterElement for each possible element. For instance, one mesh with
// three possible textures results in three CharacterElements. All 
// CharacterElements are saved as part the CharacterGenerator ScriptableObject,
// and can be used on runtime to download and load the assets required for the
// element they represent.
[Serializable]
public class CharacterElement
{
    public string name;
    public string bundleName;
   
    // The WWWs for retrieving the appropriate assetbundle are stored 
    // statically, so CharacterElements that share an assetbundle can
    // use the same WWW.
    // path to assetbundle -> WWW for retieving required assets
    static Dictionary<string, WWW> wwws = new Dictionary<string, WWW>();

    // The required assets are loaded asynchronously to avoid delays
    // when first using them. A LoadAsync results in an AssetBundleRequest
    // which are stored here so we can check their progress and use the
    // assets they contain once they are loaded.
	// TODO Cambie LoadAsync por Load, asi que no se puede utilizar AssetBundleRequest
    // AssetBundleRequest gameObjectRequest;
    // AssetBundleRequest materialRequest;
    // AssetBundleRequest boneNameRequest;
	Object gameObjectDownloaded;
	Object materialDownloaded;
	Object boneNameDownloaded;

    public CharacterElement(string name, string bundleName)
    {
        this.name = name;
        this.bundleName = bundleName;
    }

    // Returns the WWW for retieving the assetbundle required for this 
    // CharacterElement, and creates a WWW only if one doesnt exist already. 
    public WWW WWW
    {
        get
        {
            if (!wwws.ContainsKey(bundleName))
                wwws.Add(bundleName, new WWW(CharacterGenerator.AssetbundleBaseURL + bundleName));
            return wwws[bundleName];
        }
    }

    // Checks whether the SkinnedMeshRenderer and Material for this
    // CharacterElement are loaded, and starts the asynchronous loading
    // of those assets if it has not started already.
    public bool IsLoaded
    {
        get
        {
            if (!WWW.isDone) return false;

			// TODO Cambiar a LoadAsync
			if (gameObjectDownloaded == null)
				gameObjectDownloaded = WWW.assetBundle.Load("rendererobject", typeof(GameObject));

			if (materialDownloaded == null)
				materialDownloaded = WWW.assetBundle.Load(name, typeof(Material));
			
			if (boneNameDownloaded == null)
				boneNameDownloaded = WWW.assetBundle.Load("bonenames", typeof(StringHolder));

			// TODO ¿Comprobar algun error?
            //if (!gameObjectRequest.isDone) return false;
            //if (!materialRequest.isDone) return false;
            //if (!boneNameRequest.isDone) return false;

            return true;
        }
    }

    public SkinnedMeshRenderer GetSkinnedMeshRenderer()
    {
		// TODO Cambiar por Photon
		GameObject go = (GameObject)Object.Instantiate(gameObjectDownloaded);
        go.renderer.material = (Material)materialDownloaded;
        return (SkinnedMeshRenderer)go.renderer;
    }

    public string[] GetBoneNames()
    {
		var holder = (StringHolder)boneNameDownloaded;
        return holder.content;
    }
}