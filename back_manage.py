import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import uuid
import shutil

# 文件路径
DB_FILE = 'Startup_FunChinese/jokes_db.json'
IMAGE_DIR = 'Startup_FunChinese/images/'

def load_jokes():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"jokes": []}

def save_jokes(jokes):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(jokes, f, ensure_ascii=False, indent=2)

class JokeManager(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("梗图管理系统")
        self.geometry("900x600")

        self.jokes = load_jokes()

        self.create_widgets()
        self.update_joke_list()

    def create_widgets(self):
        # 左侧列表
        list_frame = ttk.Frame(self)
        list_frame.pack(side=tk.LEFT, fill=tk.BOTH, padx=10, pady=10)

        self.joke_listbox = tk.Listbox(list_frame, width=40)
        self.joke_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.joke_listbox.bind('<<ListboxSelect>>', self.on_select)

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.joke_listbox.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.joke_listbox.config(yscrollcommand=scrollbar.set)

        # 右侧表单
        form_frame = ttk.Frame(self)
        form_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        ttk.Label(form_frame, text="图片路径:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.image_path = ttk.Entry(form_frame, width=40)
        self.image_path.grid(row=0, column=1, pady=5)
        ttk.Button(form_frame, text="选择图片", command=self.choose_image).grid(row=0, column=2, pady=5)

        ttk.Label(form_frame, text="中文文本:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.chinese_text = ttk.Entry(form_frame, width=40)
        self.chinese_text.grid(row=1, column=1, columnspan=2, pady=5)

        ttk.Label(form_frame, text="英文翻译:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.english_text = ttk.Entry(form_frame, width=40)
        self.english_text.grid(row=2, column=1, columnspan=2, pady=5)

        ttk.Label(form_frame, text="关键词:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.keywords_frame = ttk.Frame(form_frame)
        self.keywords_frame.grid(row=3, column=1, columnspan=2, pady=5, sticky=tk.W)

        self.keyword_entries = []
        self.add_keyword_entry()

        ttk.Button(form_frame, text="添加关键词", command=self.add_keyword_entry).grid(row=4, column=0, pady=5)

        ttk.Button(form_frame, text="添加/更新", command=self.add_or_update_joke).grid(row=5, column=0, pady=10)
        ttk.Button(form_frame, text="删除", command=self.delete_joke).grid(row=5, column=1, pady=10)
        ttk.Button(form_frame, text="清除表单", command=self.clear_form).grid(row=5, column=2, pady=10)

    def add_keyword_entry(self):
        entry_frame = ttk.Frame(self.keywords_frame)
        entry_frame.pack(fill=tk.X, pady=2)

        entries = []
        for i, label in enumerate(["词汇", "拼音", "英文"]):
            ttk.Label(entry_frame, text=label+":").grid(row=0, column=i*2, sticky=tk.W, padx=2)
            entry = ttk.Entry(entry_frame, width=15)
            entry.grid(row=0, column=i*2+1, padx=2)
            entries.append(entry)

        self.keyword_entries.append(entries)
        return entries

    def update_joke_list(self):
        self.joke_listbox.delete(0, tk.END)
        for joke in self.jokes["jokes"]:
            self.joke_listbox.insert(tk.END, joke["chineseText"])

    def on_select(self, event):
        selection = event.widget.curselection()
        if selection:
            index = selection[0]
            joke = self.jokes["jokes"][index]
            self.image_path.delete(0, tk.END)
            self.image_path.insert(0, joke["imagePath"])
            self.chinese_text.delete(0, tk.END)
            self.chinese_text.insert(0, joke["chineseText"])
            self.english_text.delete(0, tk.END)
            self.english_text.insert(0, joke["englishTranslation"])
            
            # Clear existing keyword entries
            for entry_frame in self.keywords_frame.winfo_children():
                entry_frame.destroy()
            self.keyword_entries.clear()
            
            # Add keyword entries for existing keywords
            for keyword in joke["keywords"]:
                entries = self.add_keyword_entry()
                entries[0].insert(0, keyword['chinese'])
                entries[1].insert(0, keyword['pinyin'])
                entries[2].insert(0, keyword['english'])

    def choose_image(self):
        filepath = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg *.jpeg *.png *.gif *.bmp")])
        if filepath:
            filename = os.path.basename(filepath)
            destination = os.path.join(IMAGE_DIR, filename)
            shutil.copy(filepath, destination)
            relative_path = os.path.join('images', filename)
            self.image_path.delete(0, tk.END)
            self.image_path.insert(0, relative_path)

    def add_or_update_joke(self):
        joke_data = {
            "id": str(uuid.uuid4()),
            "imagePath": self.image_path.get(),
            "chineseText": self.chinese_text.get(),
            "englishTranslation": self.english_text.get(),
            "keywords": []
        }

        for entries in self.keyword_entries:
            if all(entry.get().strip() for entry in entries):
                joke_data["keywords"].append({
                    "chinese": entries[0].get().strip(),
                    "pinyin": entries[1].get().strip(),
                    "english": entries[2].get().strip()
                })

        selection = self.joke_listbox.curselection()
        if selection:
            # Update existing joke
            index = selection[0]
            self.jokes["jokes"][index] = joke_data
        else:
            # Add new joke
            self.jokes["jokes"].append(joke_data)

        save_jokes(self.jokes)
        self.update_joke_list()
        self.clear_form()
        messagebox.showinfo("成功", "梗图已添加/更新")

    def delete_joke(self):
        selection = self.joke_listbox.curselection()
        if selection:
            index = selection[0]
            del self.jokes["jokes"][index]
            save_jokes(self.jokes)
            self.update_joke_list()
            self.clear_form()
            messagebox.showinfo("成功", "梗图已删除")
        else:
            messagebox.showwarning("警告", "请先选择一个梗图")

    def clear_form(self):
        self.image_path.delete(0, tk.END)
        self.chinese_text.delete(0, tk.END)
        self.english_text.delete(0, tk.END)
        for entry_frame in self.keywords_frame.winfo_children():
            entry_frame.destroy()
        self.keyword_entries.clear()
        self.add_keyword_entry()  # Add one empty keyword entry
        self.joke_listbox.selection_clear(0, tk.END)

if __name__ == "__main__":
    if not os.path.exists(IMAGE_DIR):
        os.makedirs(IMAGE_DIR)
    app = JokeManager()
    app.mainloop()