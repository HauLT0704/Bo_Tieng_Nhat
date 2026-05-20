import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, BookOpen, Volume2, Loader2, Sparkles } from 'lucide-react';

export const Dictionary = ({ userStats, setUserStats, playAudio }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [customVocab, setCustomVocab] = useState([]);

  useEffect(() => {
    // Load custom vocab from local storage
    const saved = localStorage.getItem('nihongohub_v1_custom_vocab');
    if (saved) {
      setCustomVocab(JSON.parse(saved));
    }
  }, []);

  const saveVocab = (vocabList) => {
    setCustomVocab(vocabList);
    localStorage.setItem('nihongohub_v1_custom_vocab', JSON.stringify(vocabList));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError('');
    setResult(null);

    try {
      // Free MyMemory Translation API
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=vi|ja`);
      const data = await res.json();

      if (data.responseData && data.responseData.translatedText) {
        setResult({
          vi: query.trim(),
          ja: data.responseData.translatedText
        });
      } else {
        setError('Không tìm thấy bản dịch phù hợp.');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng kiểm tra mạng của ní.');
    } finally {
      setIsSearching(false);
    }
  };

  const addToVocab = () => {
    if (!result) return;
    // Check if already exists
    if (customVocab.some(v => v.ja === result.ja && v.vi === result.vi)) return;

    const newList = [{ ...result, id: Date.now() }, ...customVocab];
    saveVocab(newList);
  };

  const removeFromVocab = (id) => {
    const newList = customVocab.filter(v => v.id !== id);
    saveVocab(newList);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* L COLUMN: Tra từ */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm">
          <div className="w-full space-y-2">
            <h2 className="font-extrabold text-xl text-[var(--text-primary)] flex items-center gap-2">
              <Search size={20} className="text-[var(--bg-accent)]" />
              Tra từ Việt - Nhật
            </h2>
            <p className="text-xs font-semibold text-[var(--text-secondary)] opacity-80">
              Nhập từ vựng Tiếng Việt để lấy từ Tiếng Nhật tương ứng và lưu vào bộ Thẻ Ôn Tập.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full relative mt-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập Tiếng Việt (VD: quả táo, xin chào...)"
              className="w-full py-4 pl-5 pr-14 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold outline-none focus:border-[var(--bg-accent)] transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[var(--bg-accent)] text-white hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </form>

          {error && (
            <div className="w-full p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold text-center animate-pulse">
              {error}
            </div>
          )}

          {result && (
            <div className="w-full mt-2 p-6 rounded-2xl border-2 border-[var(--bg-accent)]/30 bg-[var(--bg-primary)] space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center space-y-2">
                <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Tiếng Nhật</div>
                <div className="text-5xl font-black text-[var(--text-primary)] py-2">
                  {result.ja}
                </div>
                <div className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest mt-4">Nghĩa Tiếng Việt</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-500">
                  {result.vi}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => playAudio(result.ja, false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-bold text-xs transition-colors"
                >
                  <Volume2 size={16} /> Nghe
                </button>
                <button
                  onClick={addToVocab}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-accent)] text-white font-bold text-xs shadow-md shadow-[var(--glow-color)] hover:scale-105 transition-transform"
                >
                  <Plus size={16} /> Thêm vào Thẻ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* R COLUMN: Danh sách từ vựng của tui */}
        <div className="lg:col-span-5 space-y-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm min-h-[400px]">
          <h3 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wide">
            <BookOpen size={16} className="text-emerald-500" />
            Sổ Tay Từ Vựng
          </h3>
          <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
            Danh sách các từ ní đã tra cứu. Hãy lưu lại để học nhé!
          </p>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {customVocab.length === 0 ? (
              <div className="text-center py-10 text-xs font-bold text-[var(--text-secondary)] opacity-60 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                Chưa có từ vựng nào. Hãy tra từ bên trái rồi thêm vào nhé!
              </div>
            ) : (
              customVocab.map((vocab) => (
                <div key={vocab.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] group hover:border-[var(--bg-accent)]/50 transition-colors">
                  <div className="flex-1 cursor-pointer" onClick={() => playAudio(vocab.ja, false)}>
                    <div className="font-black text-[var(--text-primary)] text-base">{vocab.ja}</div>
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase mt-0.5">{vocab.vi}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => playAudio(vocab.ja, false)}
                      className="p-2 text-[var(--bg-accent)] hover:bg-[var(--bg-accent)]/10 rounded-lg transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                    <button 
                      onClick={() => removeFromVocab(vocab.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
