import threading

import clip
import numpy as np
import torch


class CLIPModel:
    def __init__(self, device="cuda", model_name="RN50x4"):
        self.model_name = model_name
        self.device = device

        # jit=False required so as not to break with this version of torch
        self.model, self.transform = clip.load(self.model_name, jit=False)

        self.lock = threading.Lock()

    def inference(self, image, labels, normalize_scores=True):
        image_input = self.transform(image).unsqueeze(0).to(self.device)
        tokens = [clip.tokenize(label) for label in labels]
        text_input = torch.cat(tokens).to(self.device)
        self.lock.acquire()
        output = self.model(image_input, text_input)
        self.lock.release()
        image_probs = output[0].softmax(dim=-1).detach().cpu().numpy()[0]
        return image_probs
