<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\CardActivity;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Model::unguard();

        $board = Board::create(['name' => 'NMG Forge Board']);

        $listTodo = BoardList::create(['board_id' => $board->id, 'name' => 'To Do', 'position' => 0]);
        $listDoing = BoardList::create(['board_id' => $board->id, 'name' => 'Doing', 'position' => 1]);
        $listDone = BoardList::create(['board_id' => $board->id, 'name' => 'Done', 'position' => 2]);

        \App\Models\Member::create(['name' => 'Alice', 'avatar_initials' => 'AL']);
        \App\Models\Member::create(['name' => 'Bob', 'avatar_initials' => 'BO']);
        \App\Models\Member::create(['name' => 'Carol', 'avatar_initials' => 'CA']);

        $card1 = Card::create([
            'board_id' => $board->id,
            'list_id' => $listTodo->id,
            'title' => 'Design landing page',
            'label' => 'Design',
            'assignee' => 'Alice',
            'position' => 0
        ]);
        CardActivity::create(['card_id' => $card1->id, 'action' => 'Created']);

        $card2 = Card::create([
            'board_id' => $board->id,
            'list_id' => $listDoing->id,
            'title' => 'Fix login bug',
            'label' => 'Bug',
            'assignee' => 'Bob',
            'due_date' => now()->subDay()->toDateString(),
            'position' => 0
        ]);
        CardActivity::create(['card_id' => $card2->id, 'action' => 'Created card']);
        CardActivity::create(['card_id' => $card2->id, 'action' => 'Moved', 'from_column' => 'To Do', 'to_column' => 'Doing']);

        $card3 = Card::create([
            'board_id' => $board->id,
            'list_id' => $listDone->id,
            'title' => 'Write API docs',
            'label' => 'Feature',
            'assignee' => 'Carol',
            'position' => 0
        ]);
        CardActivity::create(['card_id' => $card3->id, 'action' => 'Created card']);
        CardActivity::create(['card_id' => $card3->id, 'action' => 'Moved', 'from_column' => 'Doing', 'to_column' => 'Done']);
        
        Model::reguard();
    }
}
