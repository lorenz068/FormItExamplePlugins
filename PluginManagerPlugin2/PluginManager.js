PluginManager = {};

PluginManager.InstalledPlugins = [];

PluginManager.RemovePluginFromInstalled = function(pluginLocation)
{
    var newInstalledList = [];
    for(var i=0; i<PluginManager.InstalledPlugins.length; i++)
    {
        if(PluginManager.InstalledPlugins[i] != pluginLocation)
        {
            newInstalledList.push(PluginManager.InstalledPlugins[i]);
        }
    }
    PluginManager.InstalledPlugins = newInstalledList;
}

PluginManager.MakePluginDivs = function()
{
    var plugins = JSON.parse(this.responseText);
    if (plugins)
    {
        plugins.forEach(function(element) {
                // Now add the plugins.
                //var pluginManifest = this.pluginSiteURL + "/" + element + "/manifest.json";
                var request = new XMLHttpRequest();
                request.addEventListener("load", PluginManager.MakePluginDiv);
                request.pluginSiteURL = this.pluginSiteURL;
                request.parentElemDiv = this.parentElemDiv;
                request.PluginURL = this.pluginSiteURL + "/" + element;
                request.open("GET", this.pluginSiteURL + "/" + element + "/manifest.json");
                request.send();

        }, this);
    }
}

PluginManager.MakePluginDiv = function(plugin)
{
    console.log("---> PluginManager.MakePluginDiv");
    //TODO (herrj): Check if this plugin is in installed plugin list and skip if it is not.
    var pluginData = JSON.parse(this.responseText);
    var pluginName = pluginData["PluginName"];
    console.log("Creating Plugin: " + pluginName);
    var pluginLocation = this.PluginURL;
    console.log("Plugin URL: " + pluginLocation);
    var pluginDescription = pluginData["PluginDescription"];
    //NOTE: "CustomDescription": *.html
    var pluginCustomDescription = pluginData["CustomDescription"];
    console.log("Custom Description: " + pluginCustomDescription);
    var descriptionContentHTML = "";
    // plugInInstalled returns a boolean value for whether the current plugin is installed.
    var plugInInstalled = PluginManager.InstalledPlugins.indexOf(pluginLocation) > -1;
    // plugInChecked returns a "checked" value to insert in the checkbox div, if the plugin is installed at initialization time
    var plugInChecked;
    if (plugInInstalled) {
        plugInChecked = "checked";
    }
        
    var elemDiv = document.createElement('div');
    elemDiv.id = 'pluginName' + pluginName.replace(/\s/g,'');
    elemDiv.className = 'pluginName';
    elemDiv.innerHTML = pluginName;
    this.parentElemDiv.appendChild(elemDiv);

    // Add checkbox input
    var checkboxElemDiv = document.createElement('div');
    checkboxElemDiv.id = pluginName.replace(/\s/g,'') + "Checkbox";
    checkboxElemDiv.style = 'float: right; display: inline; clear: right;';
    //checkboxElemDiv.innerHTML = pluginName;
    elemDiv.appendChild(checkboxElemDiv);
    var checkboxElem = document.createElement("input");
    checkboxElem.id = pluginName.replace(/\s/g,'') + "Checkbox";
    checkboxElem.type = 'checkbox';
    checkboxElem.name = 'plugInCheckBox';
    checkboxElem.value = 'Installed';
    checkboxElemDiv.appendChild(checkboxElem);

    var descriptionElemDiv = document.createElement('div');
    descriptionElemDiv.id = pluginName.replace(/\s/g,'') + "Description";
    descriptionElemDiv.style = 'clear: both;';
    elemDiv.appendChild(descriptionElemDiv);

    elemDiv.onclick = function() 
        {
            elemDiv.classList.toggle("active");
            if (descriptionElemDiv.style.maxHeight)
                {
                    descriptionElemDiv.style.maxHeight = null;
                } 
                else 
                {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                } 
    }

    //Thing will diverge here with custom description...
    if(pluginCustomDescription != undefined)
    {
        descriptionElemDiv.appendChild(document.createTextNode(pluginDescription));
    }
    else
    {
        if(pluginDescription == undefined)
        {
            pluginDescription = "Description not provided for this plugin.";
            descriptionElemDiv.appendChild(document.createTextNode(pluginDescription));
        }

    }

    var installFunctionCB = function() {
        FormItInterface.CallMethod("FormIt.InstallPlugin", JSON.stringify(pluginLocation));
        PluginManager.InstalledPlugins.push(pluginLocation);
        console.log("PluginManager.InstalledPlugins: " + JSON.stringify(PluginManager.InstalledPlugins));
        console.log("Attempted to install: " + pluginLocation);
        this.value = "Uninstall";
        this.onclick = uninstallFunctionCB;
        document.getElementById(pluginCheckboxName).checked = true;
    };

    var uninstallFunctionCB = function() {
        FormItInterface.CallMethod("FormIt.UninstallPlugin",  JSON.stringify(pluginLocation));
        PluginManager.RemovePluginFromInstalled(pluginLocation);
        console.log("PluginManager.InstalledPlugins: " + JSON.stringify(PluginManager.InstalledPlugins));
        console.log("Attempted to uninstall: " + pluginLocation);
        this.value = "Install";
        this.onclick = installFunctionCB;
        document.getElementById(pluginCheckboxName).checked = false;
    };

    if (plugInInstalled)
    {
        checkboxElemDiv.onclick = uninstallFunctionCB;
    }
    else
    {       
        checkboxElemDiv.onclick = installFunctionCB;
    }
}

PluginManager.AddPluginRepo = function(name, pluginSiteURL)
{
    var elemDiv = document.createElement('div');
    elemDiv.id = name.replace(/\s/g,'');
    elemDiv.className = "repoName";
    elemDiv.innerHTML = name;
    window.document.body.appendChild(elemDiv);
    elemDiv.onclick = function() 
        {
        elemDiv.classList.toggle("active");
        var panel = elemDiv.nextElementSibling;
        if (panel.style.maxHeight){
        panel.style.maxHeight = null;
        } else 
        {
        panel.style.maxHeight = panel.scrollHeight + "px";
        } }

    // Now add the plugins.
    var pluginsManifest = pluginSiteURL + "/plugins.json";
    var request = new XMLHttpRequest();
    request.addEventListener("load", PluginManager.MakePluginDivs);
    request.pluginSiteURL = pluginSiteURL;
    request.parentElemDiv = elemDiv;
    request.open("GET", pluginsManifest);
    request.send();
}

PluginManager.MakePluginRepoDivs = function()
{
    console.log("---> PluginManager.MakePluginRepoDivs");

    //TODO (hauswij): Figure out how to get the full URL of the plugins. This will be needed for installed comparisons.
    //Ex. FormIt will return: http://localhost:8000/PluginManager for the installed PluginManager. Need to figure out
    // how to get this current web URL to add to beginning of plugin addresses used here.
    // Diff:
    // Installed Plugin: http://localhost:8000/PluginManager
    // Building Now: ../PluginManager
    // I'm hard-coding this bit for now.
    var originURL = document.URL;
    originURL = originURL.replace('PluginManagerPlugin\/PluginManager.html', '');
    var pluginArray = JSON.parse(this.responseText);
    for(var i=0; i < pluginArray.length; i++)
    {
        var name = pluginArray[i].Name;
        var pluginSiteURL = pluginArray[i].URL;
        PluginManager.AddPluginRepo(name, pluginSiteURL);
    }
}

PluginManager.CreatePlugins = function()
{
    console.log("---> PluginManager.CreatePlugins");
    //Clear the body to reconstruct the plugin UI.
    //document.body.innerHTML = "";
    if (true)
    {
        //Start by getting internal plugins and adding them to the panel.
        //console.log("Calling FormIt.GetInstalledPlugins");
        FormItInterface.CallMethod("FormIt.GetInstalledPlugins", "",
            function(installedPlugins)
            {
                PluginManager.InstalledPlugins = eval(installedPlugins);
                if (!PluginManager.InstalledPlugins)
                {
                    PluginManager.InstalledPlugins = [];
                }
                console.log("PluginManager.InstalledPlugins: " + JSON.stringify(PluginManager.InstalledPlugins));

                //Get the list of plugins from the top level manifest
                //Keep things synchronous. Use callback method to spin off creation of plugins
                console.log("************** Requesting plugins.json to call PluginManager.MakePluginRepoDivs.");
                var request = new XMLHttpRequest();
                request.addEventListener("load", PluginManager.MakePluginRepoDivs);
                request.open("GET", "pluginsites.json");
                request.send();
            });                
    }
}
