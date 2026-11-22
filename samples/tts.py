import certifi,sys,asyncio
certifi.where=lambda:'/root/.ccr/ca-bundle.crt'
import edge_tts
v,out,text=sys.argv[1],sys.argv[2],sys.argv[3]
asyncio.run(edge_tts.Communicate(text,v,rate='+8%').save(out))
