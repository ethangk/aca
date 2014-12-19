var exobjects;
function readTextFile(file, callback)
{
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", 'asm/'+file+'#'+Math.random(), true);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			var allText = rawFile.responseText;
			document.getElementById("textbox").innerHTML = allText;
			var parsed = parseInput(allText);


			reset();
			writeRegisters();

			fillInstructions(parsed.instructions);
			fillLabels(parsed.labels);
			fillMem(parsed.memStores);
			exobjects = initProgram();
			writeMem();
			if(!!callback){
				callback(parsed);
			}
		}
	}

	rawFile.send();
}

var parseInput = function(input){
	var instructions = [];
	var labels = [];
	var memStores = [];
	var instructionCount = 0;
	input.split("\n").forEach(function(item){
		if(item.charAt(0) === ' ' || item.charAt(0) === '\t'){
			//not a label, its an instruction then
			item = item.trim();
			if(item.charAt(0) === '.'){
				//store in mem instruction
				item.slice(5).split(',').forEach(function(i){
					memStores.push({address: instructionCount, value: i.trim()});
					instructionCount++;
				});
			}
			else{
				instructions.push(item);
				instructionCount++;
			}
		}
		else if(item.trim().length != 0){
			labels.push({label: item, currentInstruction: parseInt(instructionCount,10)});
		}
	});
	return {labels: labels, instructions: instructions, memStores: memStores, totalInstructions:instructionCount};
}

function writeRegisters(){
	var contents = "";
	var regValue = 0;
	contents += "Current Instruction<br/>" + instructionBus.currentInstruction + "<br />";
	for(var i = 0; i<registerBus.numRegisters; i++){
		regValue = registerBus.fetch('r'+i);
		contents+="r"+i+"<input type='text' id='reg" + i + "' value='" + regValue + "'><br />";
	}
	document.getElementById('registers').innerHTML = contents;
}


function writeMem(){
	var contents = "Memory<br />";
	for(var i in memoryBus.memory){
		if(memoryBus.memory.hasOwnProperty(i)){
			contents+=i+":"+memoryBus.memory[i]+"<br />";
		}
	}
	document.getElementById('memory').innerHTML = contents;
	writePipeline();
}

function writePipeline(){
	var contents = "PC = ";
	// for(var i in pipeline){
	// 	if(pipeline.hasOwnProperty(i)){
	// 		contents+=i+":"+dumpObject(pipeline[i])+"<br />";
	// 	}
	// }
	contents += PCBus.fetch();
	document.getElementById('pipeline').innerHTML = contents;
}

function logRob(full){
	var i = reorderBuffer.getPointer();
	if(full)
		i = 0;
	for(; i<reorderBuffer.valuesLength; i++)
		console.log(reorderBuffer.values[i]);
}

function logUnits(){
	for(var unit in unitRef)
	{
		if(unitRef.hasOwnProperty(unit)){
			console.log(unit);
			for(var i = 0; i<unitRef[unit].length; i++)
				console.log(unitRef[unit][i]);
		}
	}
}

function writeUnits(){
	var contents = "";
	for(var unit in unitRef){
		if(unitRef.hasOwnProperty(unit)){
			contents += unit + "<br />";
			for(var i = 0; i<unitRef[unit].length; i++){
				var u = unitRef[unit][i];
				contents+"&#09;";
				if(u.busy){
					var orig = "none";
					if(!!u.unit.instructionBeingWorkedOn)
						orig = u.unit.instructionBeingWorkedOn.original;
					contents+="Busy | "+orig+" being placed in ROB["+u.dest+"], with buffer length " + u.buffer.length+"<br />";
					
				}
				else{
					contents+="Not busy<br />";
				}
			}
		}
	}
	document.getElementById('units').innerHTML = contents;
}

function writeRob(){
	var contents = "";
	contents+="POINTER = "+reorderBuffer.getPointer()+"<br />";
	for(var i = reorderBuffer.valuesLength-1; i>0; i--)
		contents+=reorderBuffer.values[i].id+", " + reorderBuffer.values[i].ready +", " + reorderBuffer.values[i].value + "," + reorderBuffer.values[i].instruction.original +"<br />";
	document.getElementById('rob').innerHTML = contents;
}

function robTest(sizes, file, results){
	
	if(sizes.length === 0){
		console.log(results);
		var cycles = [];
		var ipc	   = [];
		var table = document.getElementById('res');
		for(var i = 0; i<results.length; i++){
			cycles.push(results[i].clock);
			ipc.push(results[i].ipc);
		}
		var tr = document.createElement('tr');
		
		for(var i = 0; i<results.length; i++){
			// console.log(cycles[i]);
			var td = document.createElement('td');
			td.appendChild(document.createTextNode(cycles[i]));
            tr.appendChild(td);
		}
		table.appendChild(tr);

		var tr = document.createElement('tr');
		
		for(var i = 0; i<results.length; i++){
			// console.log(cycles[i]);
			var td = document.createElement('td');
			td.appendChild(document.createTextNode(ipc[i]));
            tr.appendChild(td);
		}
		table.appendChild(tr);

		return results;
	}

	if(results === undefined){
		results = [];
	}

	config.reorderBufferSize = sizes[0];
	readTextFile(file, function(parsed){
		run(exobjects);
		robTest(sizes.slice(1), file, results.slice(0).concat([{clock:clock, ipc: parsed.totalInstructions/clock, cpi: clock/parsed.totalInstructions, correctly: predictions.correctly, mispredicted:predictions.mispredicted}]));
	});
	
}

function robTestMultipleFiles(sizes, files){
	// var files = ['sort.asm'];
	// var sizes = [1,2,3,4];
	// robTest(sizes, 'sort2.asm');
	var output = {};
	for(var i = 0; i<files.length; i++){
		output[files[i]] = {};
		console.log(files[i]);
		var resultsTemp = robTest(sizes, files[i]);
		for(var j = 0; j<resultsTemp.length; j++){
			output[files[i]][sizes[j]] = resultsTemp[j];
		}
	}
	console.log(output);
	return output;
}

function widthTest(sizes, file, results){
	if(sizes.length === 0){
		console.log(results);
		var cycles = [];
		var ipc	   = [];
		var table = document.getElementById('res');
		for(var i = 0; i<results.length; i++){
			cycles.push(results[i].clock);
			ipc.push(results[i].ipc);
		}
		var tr = document.createElement('tr');
		
		for(var i = 0; i<results.length; i++){
			// console.log(cycles[i]);
			var td = document.createElement('td');
			td.appendChild(document.createTextNode(cycles[i]));
            tr.appendChild(td)
		}
		table.appendChild(tr);

		var tr = document.createElement('tr');
		
		for(var i = 0; i<results.length; i++){
			// console.log(cycles[i]);
			var td = document.createElement('td');
			td.appendChild(document.createTextNode(ipc[i]));
            tr.appendChild(td)
		}
		table.appendChild(tr);

		return results;
	}

	if(results === undefined){
		results = [];
	}

	config.issueWidth = sizes[0];
	readTextFile(file, function(parsed){
		run(exobjects);
		widthTest(sizes.slice(1), file, results.slice(0).concat([{clock:clock, ipc: instructionBus.issued/clock, cpi: clock/instructionBus.issued, correctly: predictions.correctly, mispredicted:predictions.mispredicted}]));
	});
}


function reorderAndWidthTest(sizes, file, results){
	if(sizes.length === 0){
		console.log(results);
		return results;
	}

	if(results === undefined){
		results = [];
	}

	config.issueWidth = sizes[0];
	readTextFile(file, function(parsed){
		run(exobjects);
		widthTest(sizes.slice(1), file, results.slice(0).concat([{clock:clock, ipc: instructionBus.issued/clock, cpi: clock/instructionBus.issued, correctly: predictions.correctly, mispredicted:predictions.mispredicted}]));
	});
}

function dumpObject(obj){
	if(typeof obj === "string")
		return obj;
	var contents = "";
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			contents+=i+":"+obj[i] + " | ";
		}
	}
	return contents.slice(0,-3);
}
