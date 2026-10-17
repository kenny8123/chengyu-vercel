// Comparison values are lesson IDs (1–40), never array positions.
export function videoOptions(lessons,item,comparisonIds=[]){
 const options=[item],seen=new Set([item.id])
 for(const id of comparisonIds){const candidate=lessons.find(x=>x.id===id);if(candidate&&!seen.has(id)){options.push(candidate);seen.add(id)}}
 // Keep a malformed future comparison row from creating missing/duplicate buttons.
 for(const candidate of lessons){if(options.length>=4)break;if(!seen.has(candidate.id)){options.push(candidate);seen.add(candidate.id)}}
 return options.slice(0,4)
}
