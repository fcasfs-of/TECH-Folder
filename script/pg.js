  document.addEventListener('DOMContentLoaded', () => {
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const fileListDiv = document.getElementById('fileList');
    const searchInput = document.getElementById('searchInput');
    const formatSelect = document.getElementById('formatSelect');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModal');

    let files = []; // Lista de arquivos carregados
    let filteredFiles = [];

    // Função para abrir o seletor de pasta
    selectFolderBtn.addEventListener('click', async () => {
      try {
        // Usa a API File System Access (compatível com browsers suportados)
        const dirHandle = await window.showDirectoryPicker();
        files = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            files.push({ name: entry.name, handle: entry });
          }
        }
        displayFileList();
      } catch (err) {
        alert('Erro ao acessar a pasta: ' + err.message);
      }
    });

    // Função para exibir a lista de arquivos
    function displayFileList() {
      const searchTerm = searchInput.value.toLowerCase();
      const formatFilter = formatSelect.value;

      filteredFiles = files.filter(file => {
        const matchSearch = file.name.toLowerCase().includes(searchTerm);
        const matchFormat = formatFilter ? file.name.toLowerCase().includes(formatFilter) : true;
        return matchSearch && matchFormat;
      });

      if (filteredFiles.length === 0) {
        fileListDiv.innerHTML = '<p>Nenhum arquivo encontrado.</p>';
        return;
      }

      fileListDiv.innerHTML = '';

      filteredFiles.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('file-item');

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('file-info');

        const iconSpan = document.createElement('span');
        iconSpan.innerHTML = getFileIcon(file.name);
        iconSpan.style.fontSize = '1.5em';

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('file-name');
        nameSpan.textContent = file.name;

        infoDiv.appendChild(iconSpan);
        infoDiv.appendChild(nameSpan);

        const actionsDiv = document.createElement('div');

        const openBtn = document.createElement('button');
        openBtn.innerHTML = '<i class="fas fa-folder-open"></i>Abrir';
        openBtn.onclick = () => openFile(file);

        actionsDiv.appendChild(openBtn);

        fileDiv.appendChild(infoDiv);
        fileDiv.appendChild(actionsDiv);
        fileListDiv.appendChild(fileDiv);
      });
    }

    // Detectar mudanças no campo de busca
    searchInput.addEventListener('input', () => {
      displayFileList();
    });

    // Detectar mudança no filtro de formato
    formatSelect.addEventListener('change', () => {
      displayFileList();
    });

    // Obter ícone baseado na extensão do arquivo
    function getFileIcon(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      const icons = {
        'mp4': '<i class="fas fa-file-video"></i>',
        'avi': '<i class="fas fa-file-video"></i>',
        'mp3': '<i class="fas fa-file-audio"></i>',
        'wav': '<i class="fas fa-file-audio"></i>',
        'pdf': '<i class="fas fa-file-pdf"></i>',
        'csv': '<i class="fas fa-file-csv"></i>',
        'xml': '<i class="fas fa-file-code"></i>',
        'html': '<i class="fas fa-file-code"></i>',
        'ini': '<i class="fas fa-file-alt"></i>',
        'txt': '<i class="fas fa-file-alt"></i>',
        'rtf': '<i class="fas fa-file-alt"></i>',
        'png': '<i class="fas fa-image"></i>',
        'jpg': '<i class="fas fa-image"></i>',
        'jpeg': '<i class="fas fa-image"></i>',
        'gif': '<i class="fas fa-image"></i>',
        'docx': '<i class="fas fa-file-word"></i>',
        'xlsx': '<i class="fas fa-file-excel"></i>',
        'exe': '<i class="fas fa-cogs"></i>',
        'dll': '<i class="fas fa-cogs"></i>',
        // padrão
        'default': '<i class="fas fa-file"></i>'
      };
      return icons[ext] || icons['default'];
    }

    // Função para abrir arquivo
    async function openFile(file) {
      try {
        const fileHandle = file.handle;
        const fileData = await fileHandle.getFile();
        const filename = fileData.name;
        const arrayBuffer = await fileData.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: fileData.type });
        const url = URL.createObjectURL(blob);

        // Determinar ação com base no formato
        const ext = filename.split('.').pop().toLowerCase();

        // Tipos de preview
        const previewTypes = ['mp4', 'avi', 'webm', 'mp3', 'wav', 'ogg', 'pdf', 'txt', 'png', 'jpg', 'jpeg', 'gif'];

        // Tipos de transcrição / extração
        const extractTypes = ['csv', 'xml', 'html', 'ini', 'txt', 'rtf', 'docx', 'xlsx'];

        // Limpar modal
        modalBody.innerHTML = '';

        // Visualizar arquivo
        if (previewTypes.includes(ext)) {
          // Para vídeos
          if (['mp4', 'avi', 'webm'].includes(ext)) {
            const video = document.createElement('video');
            video.controls = true;
            video.src = url;
            modalBody.appendChild(video);
          }
          // Para áudios
          else if (['mp3', 'wav', 'ogg'].includes(ext)) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = url;
            modalBody.appendChild(audio);
          }
          // Para PDFs
          else if (ext === 'pdf') {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            modalBody.appendChild(iframe);
          }
          // Para imagens
          else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
            const img = document.createElement('img');
            img.src = url;
            modalBody.appendChild(img);
          }
          // Para TXT
          else if (ext === 'txt') {
            const reader = new FileReader();
            reader.onload = () => {
              const pre = document.createElement('pre');
              pre.style.whiteSpace = 'pre-wrap';
              pre.textContent = reader.result;
              modalBody.appendChild(pre);
            };
            reader.readAsText(fileData);
          }

          // Botão para transcrever ou extrair texto
          const actionDiv = document.createElement('div');
          actionDiv.className = 'action-buttons';

          if (['mp4', 'avi', 'webm', 'mp3', 'wav', 'ogg', 'pdf', 'txt', 'png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
            const transcribeBtn = document.createElement('button');
            transcribeBtn.innerHTML = '<i class="fas fa-microphone"></i>Transcrever';
            transcribeBtn.onclick = () => transcribeFile(file, ext);
            actionDiv.appendChild(transcribeBtn);
          } else if (['csv', 'xml', 'html', 'ini', 'txt', 'rtf', 'docx', 'xlsx'].includes(ext)) {
            const extractBtn = document.createElement('button');
            extractBtn.innerHTML = '<i class="fas fa-file-export"></i>Extrair Texto';
            extractBtn.onclick = () => extractText(file, ext);
            actionDiv.appendChild(extractBtn);
          }

          modalBody.appendChild(actionDiv);
        }
        // Download ou abrir arquivo
        else {
          // Para EXE e DLL, apenas baixar
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = filename;
          downloadLink.textContent = 'Baixar arquivo';
          downloadLink.style.display = 'block';
          downloadLink.style.marginTop = '10px';
          modalBody.appendChild(downloadLink);
        }

        // Mostrar modal
        modal.classList.add('show');

      } catch (err) {
        alert('Erro ao abrir arquivo: ' + err.message);
      }
    }

    // Função para fechar modal
    document.getElementById('closeModal').addEventListener('click', () => {
      modal.classList.remove('show');
    });

    // Transcrever arquivo (Simulação)
    function transcribeFile(file, ext) {
      alert(`Transcrição do arquivo "${file.name}" não implementada na demo.`);
      // Implementar integração com APIs de transcrição, se necessário
    }

    // Extrair texto (Simulação)
    function extractText(file, ext) {
      alert(`Extração de texto do arquivo "${file.name}" não implementada na demo.`);
      // Implementar lógica de extração, possivelmente com APIs ou bibliotecas
    }
  });

