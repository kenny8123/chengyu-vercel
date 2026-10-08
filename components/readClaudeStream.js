// SSE records may cross network chunks, including inside a Chinese character.
export async function readClaudeStream(body,onText){
 if(!body)throw Error('沒有收到回覆，請再試一次。')
 const reader=body.getReader(),decoder=new TextDecoder()
 let buffer='',text='',complete=false
 function consume(record){
  const data=record.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n')
  if(!data)return
  const event=JSON.parse(data)
  if(event.type==='error')throw Error('回覆暫時中斷，請再試一次。')
  if(event.type==='content_block_delta'&&event.delta?.type==='text_delta'){
   text+=event.delta.text;onText(text)
  }
  if(event.type==='message_stop')complete=true
 }
 try{
  while(true){
   const {done,value}=await reader.read()
   buffer+=decoder.decode(value,{stream:!done})
   let match
   while((match=/\r?\n\r?\n/.exec(buffer))){consume(buffer.slice(0,match.index).replace(/\r\n/g,'\n'));buffer=buffer.slice(match.index+match[0].length)}
   if(done)break
  }
  if(!complete||!text)throw Error('回覆尚未完成，請再試一次。')
  return text
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
}
