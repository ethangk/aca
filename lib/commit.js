function commit(){

}

commit.prototype.run = function(){
	for(var i = 0; i<config.issueWidth; i++){
		var head = reorderBuffer.values[reorderBuffer.pointer];
		if(!head)
			return;
		console.log("ROB", reorderBuffer.pointer, head);

		if(head.ready){
			// console.log("COMMIT", reorderBuffer.pointer, head);
			var d = head.destination;
			//if its a branch, deal with that later...
			if(head.instruction.opCode === "branch"){

			}
			else if(head.instruction.opCode === "str"){
				//desination address
				memoryBus.push(head.address, head.value);
				if(head.id === reorderBuffer.latestStore){
					//latest store is done, lets update
					for(var k = reorderBuffer.latestStore+1; k<reorderBuffer.values.length; k++){
						if(reorderBuffer.values[k].instruction.opCode === "str"){
							reorderBuffer.latestStore = k;
							break;
						}
					}
					if(head.id === reorderBuffer.latestStore){
						//no update was made to latestStore
						reorderBuffer.latestStore = 0;
					}
				}
			}
			else{
				registerBus.push(d, head.value);
			}
			head.busy = false;
			reorderBuffer.pointer++;
			var regStat = registerBus.getStatus(d);
			if(regStat.reorder === head.id)
				registerBus.pushStatus(d,false,0);
		}
	}
}