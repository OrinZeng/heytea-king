#!/usr/bin/env python3
"""Download and normalize cited supplemental product images.

The catalog scraper covers current HEYTEA CDN images. This script handles
historical products and store-limited items found in reputable public sources.
Each asset is resized to a web-friendly JPEG while its original URL remains in
src/data/product-sources.json.
"""
from __future__ import annotations

import subprocess
import tempfile
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "products"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) HeyteaKingArchive/1.0"

IMAGES = {
    "zhi-zhi-mei-mei.jpg": "https://5b0988e595225.cdn.sohucs.com/images/20200425/975e02d450aa40599756e89922d6097d.jpeg",
    "zhi-zhi-mang-mang.jpg": "https://5b0988e595225.cdn.sohucs.com/q_70%2Cc_zoom%2Cw_640/images/20180921/fce75580d44942ee935b49765d40460e.jpg",
    "yu-ni-bo-bo-niu-ru.jpg": "https://cdn.yamibuy.net/sns/38f8bfd0ed59615df64a888e7b5f11cf_750x0.jpeg",
    "man-bei-cheng-cheng.jpg": "https://5b0988e595225.cdn.sohucs.com/images/20191007/5aeda70a4a114bd08e34c75015220fd9.jpeg",
    "dou-dou-bo-bo-cha.jpg": "https://5b0988e595225.cdn.sohucs.com/images/20191107/a328bf75d30243fab6640e7a359437cb.jpeg",
    "ao-li-ao-bo-bo-cha.jpg": "https://file.digitaling.com/eImg/cover/20190924/20190924153642_73009.jpg",
    "lao-guang-xian-fu-zhu-dou-jiang.jpg": "https://socialbeta.oss-cn-hangzhou.aliyuncs.com/upload/24325-1770621059.png",
    "jin-feng-cha-su.jpg": "https://www.gafei.com/uploadfile/202507/2067f27ec29b.jpg",
    "gong-yi-gelato.jpg": "https://mjpicpri.oss-cn-hangzhou.aliyuncs.com/Uploadfiles/20260708/2026070816414311116.007.jpeg",
    "liu-yi-jie-ri-tao-can.jpg": "https://q2.itc.cn/q_70/images03/20260528/cd29f52a1d3847d8b068fea66662511a.jpeg",
    "zhi-zhi-duo-rou-yang-mei.jpg": "https://p3.itc.cn/images01/20210425/6ec28cb45e8d4d82adf071473d25e155.jpeg",
    "xi-cha-ka-fei.jpg": "https://static.foodtalks.cn/image/news/cac9ddd5080d41fef099e60ded2d5ef44dbd.png",
    "man-bei-bai-xiang-guo.jpg": "https://selfpage-gips.cdn.bcebos.com/7f8307a5845777afcf79558db97a4975?x-bce-process=image%2Fauto-orient%2Co_1%2Fresize%2Cw_1242%2Climit_1%2Fquality%2CQ_86%2Fformat%2Cf_auto",
    "shuang-zha-yang-tao-you-gan.jpg": "https://static.foodtalks.cn/image/post/f9245c0a541c72583b3852a5d4c0f57e.png",
    "jin-feng-cha-wang.jpg": "https://cdn.k618img.cn/news_k618_cn/dj/202403/W020240301479338210200.png",
    "zhi-zhi-jin-feng-cha-wang.jpg": "https://q3.itc.cn/images01/20240301/d058f27e86c3426b8ba9b1230daacebb.jpeg",
    "zhi-zhi-lv-yan.jpg": "https://i0.hdslb.com/bfs/article/93b3249e096de9a87be4c41b9ad4c3f8e994c647.jpg%401192w",
    "si-ji-chun.jpg": "https://assets.bonappetit.com/photos/5a00a7f32412f963cf27dc3c/master/pass/HeyTea2.jpg",
    "chao-ji-zhi-wu-cha.jpg": "https://meizi-chao-pub.8531.cn/1874703256643297287_1280px.jpg?height=959&width=1280",
}


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for filename, url in IMAGES.items():
        destination = OUTPUT / filename
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(request, timeout=45) as response:
            payload = response.read()
        with tempfile.NamedTemporaryFile(suffix=".image") as temporary:
            temporary.write(payload)
            temporary.flush()
            subprocess.run(
                ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", "-Z", "1200", temporary.name, "--out", str(destination)],
                check=True,
                stdout=subprocess.DEVNULL,
            )
        print(f"{filename}: {destination.stat().st_size // 1024} KiB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
