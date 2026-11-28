"""Фоны в стиле A локально на CPU, бесплатно и без ключей: SDXL-Turbo (diffusers), ~25 с на кадр 1024x576.
Героя на фоне не рисуем: его добавляет stickman.py.
python background.py out.png "empty supermarket aisle at night, shelves of canned food" [seed]"""
import sys, torch
from diffusers import AutoPipelineForText2Image
STYLE=("2D hand-drawn cartoon background illustration, clean confident black ink outlines, broad flat painted color fields, simple cel shading, "
"detailed readable environment with foreground and background, animated series background art, empty scene, no people, no characters")
_pipe=None
def pipe():
    global _pipe
    if _pipe is None:
        torch.set_num_threads(4)
        _pipe=AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo",torch_dtype=torch.bfloat16,variant="fp16")
        _pipe.enable_attention_slicing()
    return _pipe
def background(scene, out, seed=11, w=1024, h=576):
    pipe()(prompt=scene+", "+STYLE,num_inference_steps=4,guidance_scale=0.0,width=w,height=h,generator=torch.Generator().manual_seed(seed)).images[0].save(out)
if __name__=="__main__":
    background(sys.argv[2], sys.argv[1], int(sys.argv[3]) if len(sys.argv)>3 else 11)
