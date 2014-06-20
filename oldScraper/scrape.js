
//from http://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js
var     lazy    = require("lazy"),
fs  = require("fs");

var agencyId = "",
agencyName = "",
uoaId = "",
uoaName = "",
rcId = "",
rcName = "",
bcId = "",
bcName = "",
m;

//new lazy(fs.createReadStream('all2.txt'))
new lazy(fs.createReadStream('firstThree.txt'))
	.lines
	.forEach(function(line){
		var lineString = String(line);
		
		//Checks for certain key text in the current line
		//TODO: These are all pretty similar, so abstract with a function
		//Couldn't get it working tonight :/

		//Check for Agency so we are logging data in the same place
		m = lineString.search("AGENCY:");
		if(m>-1){ 
	
			var tempAgencyId = String(lineString.match(/[0-9]{3}/));
			var s = lineString.indexOf(tempAgencyId);
			var tempAgencyName = lineString.substr(s+3,80).trim();
			//console.log(tempAgencyId  + " " + tempAgencyId.length + " " + typeof(tempAgencyId));
			//console.log(tempAgencyName + " " + tempAgencyName.length);
			
			//compare to current value
			if(agencyId != tempAgencyId) {
				agencyId = tempAgencyId;
				agencyName = tempAgencyName;

				//clear all subordinate variables
				uoaId = "";
				uoaName = "";
				rcId = "";
				rcName = "";
				bcId = "";
				bcName = "";

				console.log("-Agency: " + agencyId + " " + agencyName)
			};

		};

		//Check for Unit of Appropriation
		m = lineString.search("UNIT OF APPROPRIATION:");
		if(m>-1){
			var tempUoaId = String(lineString.match(/[0-9]{3}/));
			var s = lineString.indexOf(tempUoaId);
			var tempUoaName = lineString.substr(s+3,100).trim();
			//console.log(tempUoaId  + " " + tempUoaId.length + " " + typeof(tempUoaId));
			//console.log(tempUoaName + " " + tempUoaName.length);

			if(uoaId != tempUoaId) {
				uoaId = tempUoaId;
				uoaName = tempUoaName;
			
				//clear all subordinate variables
				rcId = "";
				rcName = "";
				bcId = "";
				bcName = "";

				console.log("--UOA: " + uoaId + " " + uoaName)
			};

		};

		//Check for Responsibility Center
		m = lineString.search("RESPONSIBILITY CENTER:");
		if(m>-1){
			var tempId = String(lineString.match(/[0-9]{4}/));
			if(tempId == 'null') {
				tempId = "----";
				tempName = "None";
			} else {
				var s = lineString.indexOf(tempId);
				var tempName = lineString.substr(s+4,100).trim();
			}

			if(rcId != tempId) {
				rcId = tempId;
				rcName = tempName;

				//clear all subordinate variables
				bcId = "";
				bcName = "";

				console.log("---RC: " + rcId + " " + rcName);
			};

		};

		//Check for Budget Code
		m = lineString.search("BUDGET CODE:");
		if(m>-1){
			var tempId = String(lineString.substr(12,100).match(/[A-Z0-9]{4}/));
			
			var s = lineString.indexOf(tempId);
			var tempName = lineString.substr(s+4,100).trim();
			

			if(bcId != tempId) {
				bcId = tempId;
				bcName = tempName;


				console.log("----BC: " + bcId + " " + bcName);
			};

		};

		//Check for Object Class
		var s = lineString.substr(0,3);
		var tempId = String(s.match(/\b\d{2}\b/));
		if(tempId != "null"){
			
			var tempName = String(lineString.substr(3,12));
			console.log("-----OC: " + tempId + " " + tempName);
		}

		//Check for Object
		var s = lineString.substr(23,4);
		var tempId = String(s.match(/\b\d{3}\b/));
		if(tempId != "null"){
			var tempName = String(lineString.substr(27,32));
			var fy15 = String(lineString.substr(67,17)).trim();
			console.log("------O: " + tempId + " " + tempName + " $" + fy15);
		}

	
		



	}
);

