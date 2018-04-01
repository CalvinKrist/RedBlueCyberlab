function build_boxes() {
	var boxes = []; //Will be moved into function parameters later
	boxes.push({'name': 'dc1', 'platform':'windows_x64', 'os_version':'windows_7'});
	boxes.push({'name': 'dc2', 'platform':'windows_x64', 'os_version':'windows_81'});
	
	
	var zip = new JSZip();
	
	//CREATE THE MASTER VAGRANTFILE
	var vagrantfile = "Vagrant.configure(\"2\") do |config|\n";
	
	for(var i = 0; i < boxes.length; i++) {
		vagrantfile += "\tconfig.vm.define \"" + boxes[i]['name'] + "\" do |" + boxes[i]['name'] + "|\n";
		vagrantfile += "\t\t" + boxes[i]['name'] + ".vm.box = \"../Boxes/" + boxes[i]['platform'] + "/" + boxes[i]['name'] + ".box\"\n"
		vagrantfile += "\t\t" + boxes[i]['name'] + ".vm.provider :virtualbox do |vb|\n";
		vagrantfile += "\t\t\tvb.name = \"" + boxes[i]['name'] + "\"\n";
		vagrantfile += "\t\t\tvb.gui = true\n";
		vagrantfile += "\t\t\tvb.customize [\"modifyvm\", :id, \"--memory\", 2048]\n";
		vagrantfile += "\t\t\tvb.customize [\"modifyvm\", :id, \"--cpus\", 1]\n";
		vagrantfile += "\t\t\tvb.customize [\"modifyvm\", :id, \"--vram\", \"32\"]\n";
		vagrantfile += "\t\t\tvb.customize [\"modifyvm\", :id, \"--clipboard\", \"bidirectional\"]\n";
		vagrantfile += "\t\t\tvb.customize [\"setextradata\", \"global\", \"GUI/SuppressMessages\", \"all\"]\n";
		vagrantfile += "\t\tend\n";
		vagrantfile += "\t\t\n";
		vagrantfile += "\t\t" + boxes[i]['name'] + ".winrm.transport = :plaintext\n";
		vagrantfile += "\t\t" + boxes[i]['name'] + ".winrm.basic_auth_only = true\n";
		vagrantfile += "\t\t" + boxes[i]['name'] + ".vm.communicator = \"winrm\"\n";
		vagrantfile += "\tend\n";
	}
	vagrantfile += "\nend";
	
	zip.add("Vagrantfile", vagrantfile);
	
	
	//ADD JSON CONFIGS FOR EACH MACHINE
	for(var i = 0; i < boxes.length; i++) {
		var box_json = "";
		if(boxes[i]['platform'] === "linux") {
			continue;
		} else if(boxes[i]['platform'] === "windows_x64") {
			switch(boxes[i]['os_version']) {
				case "windows_7":
					windows_7['variables']['vm_name'] = boxes[i]['name'];
					windows_7['variables']['output_dir'] = "../Boxes/" + boxes[i]['platform'] + "/" + boxes[i]['name'] + ".box"
					box_json = JSON.stringify(windows_7, null, 2);
					break;
				case "windows_81":
					windows_81['variables']['vm_name'] = boxes[i]['name'];
					windows_81['variables']['output_dir'] = "../Boxes/" + boxes[i]['platform'] + "/" + boxes[i]['name'] + ".box"
					box_json = JSON.stringify(windows_81, null, 2);
					break;
				case "windows_10":
					windows_10['variables']['vm_name'] = boxes[i]['name'];
					windows_10['variables']['output_dir'] = "../Boxes/" + boxes[i]['platform'] + "/" + boxes[i]['name'] + ".box"
					box_json = JSON.stringify(windows_10, null, 2);
					break;
				default:
					continue;
			}
		} else {
			continue;
		}
		zip.add(boxes[i]['name'] + ".json", box_json);
	}
	
	
	//GENERATE THE BUILD SCRIPT
	var build_script = "";
	
	for(var i = 0; i < boxes.length; i++) {
		build_script += "packer build " + boxes[i]['name'] + ".json\n";
	}
	build_script += "vagrant up";
	
	zip.add("build.ps1", build_script);
	
	
	//GENERATE THE ZIP FILE AND START DOWNLOAD
	content = zip.generate();
	download("data:application/zip;base64," + content, "boxes.zip", "application/zip");
}