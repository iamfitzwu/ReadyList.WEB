#!/bin/bash

# 快速生成自签名 SSL 证书（用于测试）

echo "生成自签名 SSL 证书..."

# 创建 ssl 目录
mkdir -p ssl

# 提示输入域名
read -p "请输入域名（默认: localhost）: " domain
domain=${domain:-localhost}

# 生成证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=CN/ST=State/L=City/O=Organization/CN=$domain"

# 设置权限
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

echo ""
echo "✅ SSL 证书生成成功！"
echo "   证书: ssl/cert.pem"
echo "   私钥: ssl/key.pem"
echo "   域名: $domain"
echo ""
echo "⚠️  注意：这是自签名证书，仅用于测试。"
echo "   生产环境请使用 Let's Encrypt 或购买的证书。"
echo ""
echo "📝 下一步："
echo "   1. 修改 nginx.conf 中的 server_name 为 $domain"
echo "   2. 运行: docker-compose up -d --build"
echo "   3. 访问: https://$domain"
