use std::fs::File;
use std::io::Write;
use zip::write::FileOptions;
use tauri::command;

#[derive(serde::Deserialize)]
pub struct FileItem {
    pub name: String,
    pub content: String,
}

#[command]
pub async fn save_zip(files: Vec<FileItem>, save_path: String) -> Result<(), String> {
    println!("🧩 Received save_path: {}", save_path);
    // 创建ZIP文件
    let file = File::create(&save_path)
        .map_err(|e| format!("无法创建ZIP文件: {}", e))?;

    let mut zip = zip::ZipWriter::new(file);

    // 为每个文件创建选项，显式指定类型参数为()
    for f in files {
        // 检查文件名是否包含路径分隔符
        if f.name.contains('/') || f.name.contains('\\') {
            return Err(format!("文件名 '{}' 包含无效字符", f.name));
        }
        
        // 显式指定FileOptions的类型参数为()
        let options: FileOptions<'_, ()> = FileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        
        // 开始写入文件
        zip.start_file(&f.name, options)
            .map_err(|e| format!("无法在ZIP中创建文件 '{}': {}", f.name, e))?;
        
        // 写入文件内容
        zip.write_all(f.content.as_bytes())
            .map_err(|e| format!("无法写入文件内容到 '{}': {}", f.name, e))?;
    }

    // 完成ZIP文件创建
    zip.finish()
        .map_err(|e| format!("ZIP文件创建失败: {}", e))?;
    
    Ok(())
}