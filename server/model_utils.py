import threading

import clip
import numpy as np
import torch


class CLIPModel:
    def __init__(self, device="cuda", model_name="ViT-B/32"):
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
        sim_scores = output[0].detach().cpu().numpy()[0]

        if normalize_scores:
            total = np.sum(sim_scores)
            sim_scores = sim_scores / total

        return sim_scores
