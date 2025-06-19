# Basic Tutorial: Your First Documentation Site

DocGenを使って最初のドキュメントサイトを作成する完全ガイドです。

## 前提条件

- Node.js 18.0.0以上がインストールされていること
- 基本的なMarkdownの知識
- コマンドライン操作の基本知識

## ステップ1: プロジェクトの準備

### 新しいプロジェクトディレクトリの作成

```bash
mkdir my-first-docs
cd my-first-docs
```

### プロジェクト構造の設定

```bash
mkdir docs
mkdir output
```

最終的なディレクトリ構造：

```
my-first-docs/
├── docs/
├── output/
└── package.json (後で作成)
```

## ステップ2: DocGenのインストール

### パッケージファイルの初期化

```bash
npm init -y
```

### DocGenのインストール

```bash
npm install --save-dev docgen
```

インストール確認：

```bash
npx docgen --version
```

## ステップ3: 最初のMarkdownファイル作成

### メインページの作成

`docs/README.md`を作成：

```markdown
# Welcome to My Documentation

これは私の最初のDocGenドキュメントサイトです。

## About This Site

このサイトでは以下の内容をカバーします：

- [Getting Started](getting-started.html) - 基本的な使い方
- [API Reference](api.html) - 詳細なAPI仕様
- [Examples](examples.html) - 実用的な例

## Quick Start

1. プロジェクトをクローン
2. 依存関係をインストール
3. ドキュメントをビルド

```bash
git clone https://github.com/user/project.git
cd project
npm install
npm run docs:build
```

## Features

### ✨ 主な機能

- **マークダウン対応**: GitHub Flavored Markdown完全対応
- **自動目次**: 見出しから自動的に目次を生成
- **検索機能**: 全文検索でコンテンツを素早く発見
- **レスポンシブ**: モバイルデバイス対応

### 🎨 カスタマイズ

- テーマシステム
- カスタムCSS
- プラグイン対応

## Contact

質問やサポートが必要な場合は、[GitHub Issues](https://github.com/user/project/issues)でお知らせください。
```

### サブページの作成

`docs/getting-started.md`を作成：

```markdown
# Getting Started

このページでは基本的な使用方法を説明します。

## Installation

プロジェクトのインストール方法：

```bash
npm install my-project
```

## Basic Usage

基本的な使用例：

```javascript
const MyProject = require('my-project');

const instance = new MyProject({
  option1: 'value1',
  option2: true
});

instance.doSomething();
```

## Configuration

設定ファイルの例：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "options": {
    "debug": false,
    "timeout": 5000
  }
}
```

## Next Steps

詳細については [API Reference](api.html) をご覧ください。
```

`docs/api.md`を作成：

```markdown
# API Reference

プロジェクトのAPI詳細リファレンスです。

## Classes

### MyProject

メインクラスです。

#### Constructor

```javascript
new MyProject(options)
```

**Parameters:**

- `options` (Object) - 設定オプション
  - `debug` (boolean) - デバッグモードの有効/無効
  - `timeout` (number) - タイムアウト時間（ミリ秒）

#### Methods

##### doSomething()

何かを実行します。

```javascript
instance.doSomething()
```

**Returns:** Promise<string>

##### configure(options)

設定を更新します。

```javascript
instance.configure({
  debug: true,
  timeout: 10000
})
```

**Parameters:**

- `options` (Object) - 新しい設定

## Utility Functions

### formatData(data)

データをフォーマットします。

```javascript
const formatted = formatData(rawData);
```

**Parameters:**

- `data` (any) - フォーマットするデータ

**Returns:** string - フォーマット済みデータ

## Examples

実際の使用例については [Examples](examples.html) をご覧ください。
```

`docs/examples.md`を作成：

```markdown
# Examples

実際の使用例を紹介します。

## Basic Example

最もシンプルな使用例：

```javascript
const MyProject = require('my-project');

// インスタンスの作成
const app = new MyProject();

// 基本的な処理
app.doSomething()
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Advanced Example

より高度な使用例：

```javascript
const MyProject = require('my-project');
const fs = require('fs');

// 設定ファイルの読み込み
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// カスタム設定でインスタンス作成
const app = new MyProject({
  debug: config.development,
  timeout: config.timeout || 5000,
  retries: 3
});

// エラーハンドリング付きの処理
async function processData(inputData) {
  try {
    // データの前処理
    const sanitized = sanitizeInput(inputData);
    
    // メイン処理
    const result = await app.doSomething(sanitized);
    
    // 結果の後処理
    return formatOutput(result);
    
  } catch (error) {
    console.error('Processing failed:', error.message);
    
    // フォールバック処理
    return getDefaultResult();
  }
}

function sanitizeInput(data) {
  // 入力データの検証とサニタイゼーション
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input data');
  }
  
  return {
    ...data,
    timestamp: Date.now()
  };
}

function formatOutput(result) {
  // 結果の整形
  return {
    success: true,
    data: result,
    generatedAt: new Date().toISOString()
  };
}

function getDefaultResult() {
  return {
    success: false,
    data: null,
    error: 'Processing failed, using default values'
  };
}
```

## Integration Examples

### Express.js Integration

```javascript
const express = require('express');
const MyProject = require('my-project');

const app = express();
const myProject = new MyProject();

app.use(express.json());

app.post('/api/process', async (req, res) => {
  try {
    const result = await myProject.doSomething(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### React Integration

```jsx
import React, { useState, useEffect } from 'react';
import MyProject from 'my-project';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const myProject = new MyProject({
      debug: process.env.NODE_ENV === 'development'
    });
    
    setLoading(true);
    myProject.doSomething()
      .then(data => {
        setResult(data);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>My Project Result</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default App;
```

## Testing Examples

### Unit Tests

```javascript
const MyProject = require('my-project');

describe('MyProject', () => {
  let instance;
  
  beforeEach(() => {
    instance = new MyProject({ debug: false });
  });
  
  test('should create instance with default options', () => {
    expect(instance).toBeInstanceOf(MyProject);
  });
  
  test('should process data correctly', async () => {
    const input = { test: true };
    const result = await instance.doSomething(input);
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
  
  test('should handle errors gracefully', async () => {
    const invalidInput = null;
    
    await expect(instance.doSomething(invalidInput))
      .rejects
      .toThrow('Invalid input');
  });
});
```

## Configuration Examples

### Environment-based Configuration

```javascript
// config/development.js
module.exports = {
  debug: true,
  timeout: 10000,
  retries: 1,
  logLevel: 'debug'
};

// config/production.js
module.exports = {
  debug: false,
  timeout: 5000,
  retries: 3,
  logLevel: 'error'
};

// main.js
const env = process.env.NODE_ENV || 'development';
const config = require(`./config/${env}`);
const MyProject = require('my-project');

const app = new MyProject(config);
```

これらの例を参考に、あなたのプロジェクトに合わせてカスタマイズしてください。

## Related

- [Getting Started](getting-started.html) - 基本的な使い方
- [API Reference](api.html) - 詳細なAPI仕様
- [Advanced Tutorial](advanced.html) - より高度な使用方法
```

## ステップ4: HTMLの生成

### 基本的なビルド

```bash
npx docgen build docs/ --output output/
```

### 結果の確認

`output/`ディレクトリに以下のファイルが生成されます：

- `README.html` - メインページ
- `getting-started.html` - 入門ガイド
- `api.html` - APIリファレンス
- `examples.html` - 使用例
- `styles.css` - スタイルシート

### ブラウザでの確認

生成されたHTMLファイルをブラウザで開いて確認します：

```bash
# macOS
open output/README.html

# Windows
start output/README.html

# Linux
xdg-open output/README.html
```

## ステップ5: npm scriptsの設定

作業を効率化するため、`package.json`にスクリプトを追加：

```json
{
  "scripts": {
    "docs:build": "docgen build docs/ --output output/",
    "docs:dev": "docgen build docs/ --output output/ --watch",
    "docs:clean": "rm -rf output/",
    "docs:serve": "npx http-server output/ -p 8080"
  }
}
```

使用方法：

```bash
# ドキュメントのビルド
npm run docs:build

# 開発モード（ファイル監視）
npm run docs:dev

# 生成ファイルのクリーンアップ
npm run docs:clean

# ローカルサーバーで確認
npm run docs:serve
```

## ステップ6: 継続的な改善

### ファイル監視での開発

開発中はウォッチモードを使用：

```bash
npm run docs:dev
```

これにより、Markdownファイルを編集すると自動的にHTMLが再生成されます。

### リンクの確認

生成されたHTMLでリンクが正しく動作することを確認：

- 内部リンクが`.html`拡張子付きになっている
- 目次のリンクが正しいセクションにジャンプする
- 検索機能が動作する

## 次のステップ

基本的なドキュメントサイトが完成しました！次は以下を試してみてください：

- [Advanced Tutorial](advanced.html) - より高度な機能
- カスタムテーマの作成
- GitHub Pagesでの公開
- 継続的インテグレーションの設定

## トラブルシューティング

よくある問題と解決方法：

**Q: HTMLが生成されない**
- パスが正しいか確認
- Markdownファイルの構文エラーをチェック

**Q: リンクが動作しない**
- 相対パスを使用しているか確認
- ファイル名と拡張子が一致しているか確認

**Q: 検索が動作しない**
- ローカルサーバー経由でアクセスしているか確認
- JavaScriptが有効になっているか確認