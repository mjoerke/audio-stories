import threading

import clip
import torch


class CLIPModel:
    def __init__(self, device, model_name="ViT-B/32"):
        self.model_name = model_name
        self.device = device

        # jit=False required so as not to break with this version of torch
        self.model, self.transform = clip.load(self.model_name, jit=False)

        self.lock = threading.Lock()

    def inference(self, image, labels):
        raise NotImplemented()
        # image_input = self.transform(image).unsqueeze(0).to(self.device)
        # text_input = torch.cat([])
